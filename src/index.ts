import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { PROGRAM_ID } from "./generated/programId";
import {
  initNamespace,
  initProposal,
  stake,
  unstake,
  updateNamespace,
  updateProposal,
  vote,
  stakeTo,
  initDistribution,
  claimFromDistribution,
  updateDistribution,
  withdrawFromDistribution,
} from "./generated/instructions";
import BN from "bn.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { createHash } from "crypto";

export * from "./generated/instructions";
export * from "./generated/accounts";

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export class VeTokenSDK {
  private deployer: PublicKey;
  private securityCouncil: PublicKey;
  private reviewCouncil: PublicKey;
  private tokenMint: PublicKey;
  private tokenProgram: PublicKey;

  constructor(
    deployer: PublicKey,
    securityCouncil: PublicKey,
    reviewCouncil: PublicKey,
    tokenMint: PublicKey,
    tokenProgram: PublicKey
  ) {
    this.deployer = deployer;
    this.securityCouncil = securityCouncil;
    this.reviewCouncil = reviewCouncil;
    this.tokenMint = tokenMint;
    this.tokenProgram = tokenProgram;
  }

  ata(owner: PublicKey) {
    const [ata] = PublicKey.findProgramAddressSync(
      [
        owner.toBuffer(),
        this.tokenProgram.toBuffer(),
        this.tokenMint.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return ata;
  }

  pdaNamespace() {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("namespace"),
        this.tokenMint.toBuffer(),
        this.deployer.toBuffer(),
      ],
      PROGRAM_ID
    );
    return pda;
  }

  pdaLockup(owner: PublicKey) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("lockup"), this.pdaNamespace().toBuffer(), owner.toBuffer()],
      PROGRAM_ID
    );
    return pda;
  }

  pdaVoteRecord(owner: PublicKey, proposal: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vote_record"),
        this.pdaNamespace().toBuffer(),
        owner.toBuffer(),
        proposal.toBuffer(),
      ],
      PROGRAM_ID
    );
    return pda;
  }

  pdaProposal(proposal_nonce: number) {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("proposal"),
        this.pdaNamespace().toBuffer(),
        new BN(proposal_nonce).toArrayLike(Buffer, "le", 4),
      ],
      PROGRAM_ID
    );
    return pda;
  }

  pdaDistribution(cosigner1: PublicKey, cosigner2: PublicKey, uuid: PublicKey) {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("distribution"),
        this.pdaNamespace().toBuffer(),
        cosigner1.toBuffer(),
        cosigner2.toBuffer(),
        uuid.toBuffer(),
      ],
      PROGRAM_ID
    );
    return pda;
  }

  pdaDistributionClaim(claimant: PublicKey, cosignedMsg: string) {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("claim"),
        this.pdaNamespace().toBuffer(),
        createHash('sha256').update(cosignedMsg).digest(),
      ],
      PROGRAM_ID
    );
    return pda;
  }

  newTx() {
    const tx = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 400_000,
      }),
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 10_000,
      })
    );
    return tx;
  }

  txInitNamespace() {
    const ix = initNamespace({
      deployer: this.deployer,
      securityCouncil: this.securityCouncil,
      reviewCouncil: this.reviewCouncil,
      ns: this.pdaNamespace(),
      systemProgram: SystemProgram.programId,
      tokenMint: this.tokenMint,
    });
    return this.newTx().add(ix);
  }

  txUpdateNamespace(
    securityCouncil: PublicKey,
    reviewCouncil: PublicKey,
    lockupDefaultTargetRewardsPct: number,
    lockupDefaultTargetVotingPct: number,
    lockupMinDuration: BN,
    lockupMinAmount: BN,
    lockupMaxSaturation: BN,
    proposalMinVotingPowerForQuorum: BN,
    proposalMinPassPct: number,
    proposalCanUpdateAfterVotes: boolean
  ) {
    const ix = updateNamespace(
      {
        args: {
          securityCouncil,
          reviewCouncil,
          lockupDefaultTargetRewardsPct,
          lockupDefaultTargetVotingPct,
          lockupMinDuration,
          lockupMinAmount,
          lockupMaxSaturation,
          proposalMinVotingPowerForQuorum,
          proposalMinPassPct,
          proposalCanUpdateAfterVotes,
        },
      },
      {
        securityCouncil: this.securityCouncil,
        ns: this.pdaNamespace(),
      }
    );
    return this.newTx().add(ix);
  }

  txStake(owner: PublicKey, amount: BN, endTs: BN) {
    const lockup = this.pdaLockup(owner);
    const ix = stake(
      {
        args: { amount, endTs },
      },
      {
        owner,
        tokenMint: this.tokenMint,
        tokenAccount: this.ata(owner),
        lockup,
        lockupTokenAccount: this.ata(lockup),
        ns: this.pdaNamespace(),
        tokenProgram: this.tokenProgram,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      }
    );
    return this.newTx().add(ix);
  }

  txStakeTo(owner: PublicKey, amount: BN, endTs: BN) {
    const lockup = this.pdaLockup(owner);
    const ix = stakeTo(
      {
        args: { amount, endTs, disableRewards: true },
      },
      {
        securityCouncil: this.securityCouncil,
        owner,
        tokenMint: this.tokenMint,
        tokenAccount: this.ata(this.securityCouncil),
        lockup,
        lockupTokenAccount: this.ata(lockup),
        ns: this.pdaNamespace(),
        tokenProgram: this.tokenProgram,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      }
    );
    return this.newTx().add(ix);
  }

  txUnstake(owner: PublicKey) {
    const lockup = this.pdaLockup(owner);
    const ix = unstake({
      owner,
      tokenMint: this.tokenMint,
      tokenAccount: this.ata(owner),
      lockup,
      lockupTokenAccount: this.ata(lockup),
      ns: this.pdaNamespace(),
      tokenProgram: this.tokenProgram,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    });
    return this.newTx().add(ix);
  }

  txInitProposal(
    reviewCouncil: PublicKey,
    proposal_nonce: number,
    uri: string,
    startTs: BN,
    endTs: BN
  ) {
    const ix = initProposal(
      {
        args: {
          startTs,
          endTs,
          uri,
        },
      },
      {
        reviewCouncil,
        ns: this.pdaNamespace(),
        proposal: this.pdaProposal(proposal_nonce),
        systemProgram: SystemProgram.programId,
      }
    );
    return this.newTx().add(ix);
  }

  txUpdateProposal(
    reviewCouncil: PublicKey,
    proposal: PublicKey,
    uri: string,
    startTs: BN,
    endTs: BN
  ) {
    const ix = updateProposal(
      {
        args: {
          startTs,
          endTs,
          uri,
        },
      },
      {
        ns: this.pdaNamespace(),
        proposal,
        reviewCouncil,
      }
    );
    return this.newTx().add(ix);
  }

  txVote(owner: PublicKey, proposal: PublicKey, choice: number) {
    const ix = vote(
      {
        args: { choice },
      },
      {
        ns: this.pdaNamespace(),
        owner,
        proposal,
        lockup: this.pdaLockup(owner),
        voteRecord: this.pdaVoteRecord(owner, proposal),
        systemProgram: SystemProgram.programId,
      }
    );
    return this.newTx().add(ix);
  }

  txInitDistribution(
    payer: PublicKey,
    uuid: PublicKey,
    cosigner1: PublicKey,
    cosigner2: PublicKey,
    startTs: BN
  ) {
    const ix = initDistribution(
      {
        args: {
          cosigner1,
          cosigner2,
          startTs,
        },
      },
      {
        ns: this.pdaNamespace(),
        payer,
        distribution: this.pdaDistribution(cosigner1, cosigner2, uuid),
        distributionTokenMint: this.tokenMint,
        systemProgram: SystemProgram.programId,
        uuid,
      }
    );
    return this.newTx().add(ix);
  }

  txUpdateDistribution(
    distribution: PublicKey,
    startTs: BN
  ) {
    const ix = updateDistribution(
      {
        args: {
          startTs,
        },
      },
      {
        ns: this.pdaNamespace(),
        distribution,
        securityCouncil: this.securityCouncil,
      }
    );
    return this.newTx().add(ix);
  }

  txWithdrawFromDistribution(
    distribution: PublicKey,
    distributionTokenAccount?: PublicKey,
  ) {
    const ix = withdrawFromDistribution(
      {
        ns: this.pdaNamespace(),
        distribution,
        securityCouncil: this.securityCouncil,
        distributionTokenMint: this.tokenMint,
        distributionTokenAccount: distributionTokenAccount ?? this.ata(distribution),
        securityCouncilTokenAccount: this.ata(this.securityCouncil),
        tokenProgram: this.tokenProgram,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      }
    );
    return this.newTx().add(ix);
  }

  txClaimFromDistribution(
    payer: PublicKey,
    distribution: PublicKey,
    distributionTokenAccount: PublicKey,
    cosigner1: PublicKey,
    cosigner2: PublicKey,
    claimant: PublicKey,
    amount: BN,
    cosignedMsg: string
  ) {
    const ix = claimFromDistribution(
      {
        args: {
          amount,
          cosignedMsg: Array.from(createHash('sha256').update(cosignedMsg).digest()),
        },
      },
      {
        ns: this.pdaNamespace(),
        payer,
        distribution,
        distributionTokenMint: this.tokenMint,
        systemProgram: SystemProgram.programId,
        claimant,
        cosigner1,
        cosigner2,
        distributionClaim: this.pdaDistributionClaim(claimant, cosignedMsg),
        distributionTokenAccount,
        claimantTokenAccount: getAssociatedTokenAddressSync(
          this.tokenMint,
          claimant,
          true
        ),
        tokenProgram: this.tokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      }
    );
    return this.newTx().add(ix);
  }
}
