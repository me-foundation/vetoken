import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { PROGRAM_ID } from "./generated/programId";
import {
  initGlobal,
  initProposal,
  stake,
  unstake,
  updateGlobal,
  updateProposal,
  vote,
} from "./generated/instructions";
import BN from "bn.js";

export * from "./generated/instructions";
export * from "./generated/accounts";

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
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
    tokenProgram: PublicKey,
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
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    return ata;
  }

  pdaGlobal() {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global")],
      PROGRAM_ID,
    );
    return pda;
  }

  pdaLockup(owner: PublicKey) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("lockup"), owner.toBuffer()],
      PROGRAM_ID,
    );
    return pda;
  }

  pdaVoteRecord(owner: PublicKey, proposal: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), owner.toBuffer(), proposal.toBuffer()],
      PROGRAM_ID,
    );
    return pda;
  }

  pdaProposal(proposal_nonce: number) {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("proposal"),
        new BN(proposal_nonce).toArrayLike(Buffer, "le", 4),
      ],
      PROGRAM_ID,
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
      }),
    );
    return tx;
  }

  txInitGlobal() {
    const ix = initGlobal({
      authority: this.deployer,
      securityCouncil: this.securityCouncil,
      global: this.pdaGlobal(),
      systemProgram: SystemProgram.programId,
    });
    return this.newTx().add(ix);
  }

  txUpdateGlobal(newSecurityCouncil: PublicKey, debugTsOffset: BN | null) {
    const ix = updateGlobal(
      {
        args: {
          newSecurityCouncil,
          debugTsOffset,
        },
      },
      {
        securityCouncil: this.securityCouncil,
        global: this.pdaGlobal(),
      },
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
        global: this.pdaGlobal(),
        tokenProgram: this.tokenProgram,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
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
      global: this.pdaGlobal(),
      tokenProgram: this.tokenProgram,
    });
    return this.newTx().add(ix);
  }

  txInitProposal(
    owner: PublicKey,
    proposal_nonce: number,
    uri: string,
    startTs: BN,
    endTs: BN,
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
        global: this.pdaGlobal(),
        proposal: this.pdaProposal(proposal_nonce),
        systemProgram: SystemProgram.programId,
      },
    );
    return this.newTx().add(ix);
  }

  txUpdateProposal(
    payer: PublicKey,
    proposal: PublicKey,
    uri: string,
    startTs: BN,
    endTs: BN,
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
        global: this.pdaGlobal(),
        proposal,
        payer,
      },
    );
    return this.newTx().add(ix);
  }

  txVote(owner: PublicKey, proposal: PublicKey, choice: number) {
    const ix = vote(
      {
        args: { choice },
      },
      {
        global: this.pdaGlobal(),
        owner,
        proposal,
        lockup: this.pdaLockup(owner),
        voteRecord: this.pdaVoteRecord(owner, proposal),
        systemProgram: SystemProgram.programId,
      },
    );
    return this.newTx().add(ix);
  }
}
