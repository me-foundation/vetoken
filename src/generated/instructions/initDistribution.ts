import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitDistributionArgs {
  args: types.InitDistributionArgsFields
}

export interface InitDistributionAccounts {
  payer: PublicKey
  distribution: PublicKey
  distributionTokenMint: PublicKey
  ns: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([types.InitDistributionArgs.layout("args")])

export function initDistribution(
  args: InitDistributionArgs,
  accounts: InitDistributionAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.distribution, isSigner: false, isWritable: true },
    {
      pubkey: accounts.distributionTokenMint,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.ns, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([233, 255, 155, 39, 32, 80, 14, 39])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      args: types.InitDistributionArgs.toEncodable(args.args),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
