import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UnstakeAccounts {
  owner: PublicKey
  tokenMint: PublicKey
  tokenAccount: PublicKey
  lockup: PublicKey
  lockupTokenAccount: PublicKey
  global: PublicKey
  tokenProgram: PublicKey
}

export function unstake(
  accounts: UnstakeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
    { pubkey: accounts.tokenMint, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.lockup, isSigner: false, isWritable: true },
    { pubkey: accounts.lockupTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.global, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([90, 95, 107, 42, 205, 124, 50, 225])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
