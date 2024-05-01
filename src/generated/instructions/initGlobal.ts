import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitGlobalAccounts {
  authority: PublicKey
  securityCouncil: PublicKey
  global: PublicKey
  systemProgram: PublicKey
}

export function initGlobal(
  accounts: InitGlobalAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.authority, isSigner: true, isWritable: true },
    { pubkey: accounts.securityCouncil, isSigner: false, isWritable: false },
    { pubkey: accounts.global, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([44, 238, 77, 253, 76, 182, 192, 162])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
