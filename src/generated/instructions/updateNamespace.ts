import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateNamespaceArgs {
  args: types.UpdateNamespaceArgsFields
}

export interface UpdateNamespaceAccounts {
  securityCouncil: PublicKey
  ns: PublicKey
}

export const layout = borsh.struct([types.UpdateNamespaceArgs.layout("args")])

export function updateNamespace(
  args: UpdateNamespaceArgs,
  accounts: UpdateNamespaceAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.securityCouncil, isSigner: true, isWritable: false },
    { pubkey: accounts.ns, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([61, 107, 207, 79, 239, 88, 36, 255])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      args: types.UpdateNamespaceArgs.toEncodable(args.args),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
