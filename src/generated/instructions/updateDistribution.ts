import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UpdateDistributionArgs {
  args: types.UpdateDistributionArgsFields
}

export interface UpdateDistributionAccounts {
  securityCouncil: PublicKey
  distribution: PublicKey
  ns: PublicKey
}

export const layout = borsh.struct([
  types.UpdateDistributionArgs.layout("args"),
])

export function updateDistribution(
  args: UpdateDistributionArgs,
  accounts: UpdateDistributionAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.securityCouncil, isSigner: true, isWritable: true },
    { pubkey: accounts.distribution, isSigner: false, isWritable: true },
    { pubkey: accounts.ns, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([128, 196, 209, 174, 42, 209, 164, 222])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      args: types.UpdateDistributionArgs.toEncodable(args.args),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
