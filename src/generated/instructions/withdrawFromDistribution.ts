import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface WithdrawFromDistributionAccounts {
  securityCouncil: PublicKey
  distribution: PublicKey
  distributionTokenMint: PublicKey
  distributionTokenAccount: PublicKey
  securityCouncilTokenAccount: PublicKey
  ns: PublicKey
  tokenProgram: PublicKey
  systemProgram: PublicKey
  associatedTokenProgram: PublicKey
}

export function withdrawFromDistribution(
  accounts: WithdrawFromDistributionAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.securityCouncil, isSigner: true, isWritable: true },
    { pubkey: accounts.distribution, isSigner: false, isWritable: false },
    {
      pubkey: accounts.distributionTokenMint,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: accounts.distributionTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: accounts.securityCouncilTokenAccount,
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
  const identifier = Buffer.from([176, 19, 213, 219, 200, 84, 232, 55])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
