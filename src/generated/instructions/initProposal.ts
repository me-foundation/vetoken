import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitProposalArgs {
  args: types.InitProposalArgsFields
}

export interface InitProposalAccounts {
  owner: PublicKey
  proposal: PublicKey
  lockup: PublicKey
  ns: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([types.InitProposalArgs.layout("args")])

export function initProposal(
  args: InitProposalArgs,
  accounts: InitProposalAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
    { pubkey: accounts.proposal, isSigner: false, isWritable: true },
    { pubkey: accounts.lockup, isSigner: false, isWritable: false },
    { pubkey: accounts.ns, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([113, 76, 165, 176, 110, 138, 198, 178])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      args: types.InitProposalArgs.toEncodable(args.args),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
