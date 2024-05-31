import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ClaimFromDistributionArgs {
  args: types.ClaimFromDistributionArgsFields
}

export interface ClaimFromDistributionAccounts {
  payer: PublicKey
  claimant: PublicKey
  cosigner1: PublicKey
  cosigner2: PublicKey
  distributionClaim: PublicKey
  distribution: PublicKey
  distributionTokenMint: PublicKey
  delegatedTokenAccount: PublicKey
  claimantTokenAccount: PublicKey
  ns: PublicKey
  tokenProgram: PublicKey
  systemProgram: PublicKey
  associatedTokenProgram: PublicKey
}

export const layout = borsh.struct([
  types.ClaimFromDistributionArgs.layout("args"),
])

export function claimFromDistribution(
  args: ClaimFromDistributionArgs,
  accounts: ClaimFromDistributionAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.claimant, isSigner: false, isWritable: false },
    { pubkey: accounts.cosigner1, isSigner: true, isWritable: false },
    { pubkey: accounts.cosigner2, isSigner: true, isWritable: false },
    { pubkey: accounts.distributionClaim, isSigner: false, isWritable: true },
    { pubkey: accounts.distribution, isSigner: false, isWritable: false },
    {
      pubkey: accounts.distributionTokenMint,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: accounts.delegatedTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: accounts.claimantTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.ns, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
  ]
  const identifier = Buffer.from([4, 56, 229, 48, 170, 15, 253, 5])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      args: types.ClaimFromDistributionArgs.toEncodable(args.args),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
