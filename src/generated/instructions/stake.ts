import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface StakeArgs {
  args: types.StakeArgsFields
}

export interface StakeAccounts {
  owner: PublicKey
  tokenMint: PublicKey
  tokenAccount: PublicKey
  lockup: PublicKey
  lockupTokenAccount: PublicKey
  ns: PublicKey
  tokenProgram: PublicKey
  systemProgram: PublicKey
  associatedTokenProgram: PublicKey
}

export const layout = borsh.struct([types.StakeArgs.layout("args")])

export function stake(
  args: StakeArgs,
  accounts: StakeAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
    { pubkey: accounts.tokenMint, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.lockup, isSigner: false, isWritable: true },
    { pubkey: accounts.lockupTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.ns, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
  ]
  const identifier = Buffer.from([206, 176, 202, 18, 200, 209, 179, 108])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      args: types.StakeArgs.toEncodable(args.args),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
