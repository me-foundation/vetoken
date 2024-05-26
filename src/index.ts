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
} from "./generated/instructions";
import BN from "bn.js";

export * from "./generated/instructions";
export * from "./generated/accounts";

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export class VeTokenSDK {
  private deployer: PublicKey;
  private securityCouncil: PublicKey;
  private tokenMint: PublicKey;
  private tokenProgram: PublicKey;

  constructor(
    deployer: PublicKey,
    securityCouncil: PublicKey,
    tokenMint: PublicKey,
    tokenProgram: PublicKey
  ) {
    this.deployer = deployer;
    this.securityCouncil = securityCouncil;
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
      ns: this.pdaNamespace(),
      systemProgram: SystemProgram.programId,
      tokenMint: this.tokenMint,
    });
    return this.newTx().add(ix);
  }

  txUpdateNamespace(
    securityCouncil: PublicKey | null,
    debugTsOffset: BN | null,
    lockupDefaultTargetRewardsBp: number | null,
    lockupDefaultTargetVotingBp: number | null,
    lockupMinDuration: BN | null,
    lockupMinAmount: BN | null,
    lockupMaxSaturation: BN | null,
    proposalMinVotingPowerForCreation: BN | null,
    proposalMinVotingPowerForQuorum: BN | null,
    proposalMinPassBp: number | null
  ) {
    const ix = updateNamespace(
      {
        args: {
          securityCouncil,
          debugTsOffset,
          lockupDefaultTargetRewardsBp,
          lockupDefaultTargetVotingBp,
          lockupMinDuration,
          lockupMinAmount,
          lockupMaxSaturation,
          proposalMinVotingPowerForCreation,
          proposalMinVotingPowerForQuorum,
          proposalMinPassBp,
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
        args: { amount, endTs, disableRewardsBp: true },
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
    });
    return this.newTx().add(ix);
  }

  txInitProposal(
    owner: PublicKey,
    proposal_nonce: number,
    uri: string,
    startTs: BN,
    endTs: BN
  ) {
    const ix = initProposal(
      {
        args: {
          uri: Buffer.from(uri).toJSON().data,
          startTs,
          endTs,
        },
      },
      {
        owner,
        lockup: this.pdaLockup(owner),
        ns: this.pdaNamespace(),
        proposal: this.pdaProposal(proposal_nonce),
        systemProgram: SystemProgram.programId,
      }
    );
    return this.newTx().add(ix);
  }

  txUpdateProposal(
    payer: PublicKey,
    proposal: PublicKey,
    uri: string,
    startTs: BN,
    endTs: BN
  ) {
    const ix = updateProposal(
      {
        args: {
          uri: Buffer.from(uri).toJSON().data,
          startTs,
          endTs,
        },
      },
      {
        ns: this.pdaNamespace(),
        proposal,
        payer,
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
}
