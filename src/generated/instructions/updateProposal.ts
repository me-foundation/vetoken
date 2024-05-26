import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateProposalArgs {
  args: types.UpdateProposalArgsFields
}

export interface UpdateProposalAccounts {
  reviewCouncil: PublicKey
  proposal: PublicKey
  ns: PublicKey
}

export const layout = borsh.struct([types.UpdateProposalArgs.layout("args")])

export function updateProposal(
  args: UpdateProposalArgs,
  accounts: UpdateProposalAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.reviewCouncil, isSigner: true, isWritable: true },
    { pubkey: accounts.proposal, isSigner: false, isWritable: true },
    { pubkey: accounts.ns, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([47, 144, 37, 102, 101, 215, 171, 47])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      args: types.UpdateProposalArgs.toEncodable(args.args),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
