import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface StakeToArgs {
  args: types.StakeToArgsFields
}

export interface StakeToAccounts {
  securityCouncil: PublicKey
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

export const layout = borsh.struct([types.StakeToArgs.layout("args")])

export function stakeTo(
  args: StakeToArgs,
  accounts: StakeToAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.securityCouncil, isSigner: true, isWritable: true },
    { pubkey: accounts.owner, isSigner: false, isWritable: false },
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
  const identifier = Buffer.from([122, 30, 99, 67, 9, 165, 237, 134])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      args: types.StakeToArgs.toEncodable(args.args),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
