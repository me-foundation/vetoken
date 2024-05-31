import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface ClaimFromDistributionArgsFields {
  amount: BN
  cosignedMsg: Array<number>
}

export interface ClaimFromDistributionArgsJSON {
  amount: string
  cosignedMsg: Array<number>
}

export class ClaimFromDistributionArgs {
  readonly amount: BN
  readonly cosignedMsg: Array<number>

  constructor(fields: ClaimFromDistributionArgsFields) {
    this.amount = fields.amount
    this.cosignedMsg = fields.cosignedMsg
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u64("amount"), borsh.array(borsh.u8(), 32, "cosignedMsg")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new ClaimFromDistributionArgs({
      amount: obj.amount,
      cosignedMsg: obj.cosignedMsg,
    })
  }

  static toEncodable(fields: ClaimFromDistributionArgsFields) {
    return {
      amount: fields.amount,
      cosignedMsg: fields.cosignedMsg,
    }
  }

  toJSON(): ClaimFromDistributionArgsJSON {
    return {
      amount: this.amount.toString(),
      cosignedMsg: this.cosignedMsg,
    }
  }

  static fromJSON(
    obj: ClaimFromDistributionArgsJSON
  ): ClaimFromDistributionArgs {
    return new ClaimFromDistributionArgs({
      amount: new BN(obj.amount),
      cosignedMsg: obj.cosignedMsg,
    })
  }

  toEncodable() {
    return ClaimFromDistributionArgs.toEncodable(this)
  }
}
