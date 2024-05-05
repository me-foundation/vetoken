import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface VoteArgs {
  args: types.VoteArgsFields
}

export interface VoteAccounts {
  owner: PublicKey
  proposal: PublicKey
  lockup: PublicKey
  voteRecord: PublicKey
  global: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([types.VoteArgs.layout("args")])

export function vote(
  args: VoteArgs,
  accounts: VoteAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
    { pubkey: accounts.proposal, isSigner: false, isWritable: true },
    { pubkey: accounts.lockup, isSigner: false, isWritable: false },
    { pubkey: accounts.voteRecord, isSigner: false, isWritable: true },
    { pubkey: accounts.global, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([227, 110, 155, 23, 136, 126, 172, 25])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      args: types.VoteArgs.toEncodable(args.args),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
