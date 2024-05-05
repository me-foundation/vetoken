import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateGlobalArgs {
  args: types.UpdateGlobalArgsFields
}

export interface UpdateGlobalAccounts {
  securityCouncil: PublicKey
  global: PublicKey
}

export const layout = borsh.struct([types.UpdateGlobalArgs.layout("args")])

export function updateGlobal(
  args: UpdateGlobalArgs,
  accounts: UpdateGlobalAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.securityCouncil, isSigner: true, isWritable: false },
    { pubkey: accounts.global, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([90, 152, 240, 21, 199, 38, 72, 20])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      args: types.UpdateGlobalArgs.toEncodable(args.args),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
