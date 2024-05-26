import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitNamespaceAccounts {
  deployer: PublicKey
  securityCouncil: PublicKey
  reviewCouncil: PublicKey
  tokenMint: PublicKey
  ns: PublicKey
  systemProgram: PublicKey
}

export function initNamespace(
  accounts: InitNamespaceAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.deployer, isSigner: true, isWritable: true },
    { pubkey: accounts.securityCouncil, isSigner: false, isWritable: false },
    { pubkey: accounts.reviewCouncil, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenMint, isSigner: false, isWritable: false },
    { pubkey: accounts.ns, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([92, 48, 33, 234, 12, 198, 94, 189])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
