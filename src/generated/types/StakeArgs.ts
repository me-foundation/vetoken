import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface StakeArgsFields {
  amount: BN
  endTs: BN
}

export interface StakeArgsJSON {
  amount: string
  endTs: string
}

export class StakeArgs {
  readonly amount: BN
  readonly endTs: BN

  constructor(fields: StakeArgsFields) {
    this.amount = fields.amount
    this.endTs = fields.endTs
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u64("amount"), borsh.i64("endTs")], property)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new StakeArgs({
      amount: obj.amount,
      endTs: obj.endTs,
    })
  }

  static toEncodable(fields: StakeArgsFields) {
    return {
      amount: fields.amount,
      endTs: fields.endTs,
    }
  }

  toJSON(): StakeArgsJSON {
    return {
      amount: this.amount.toString(),
      endTs: this.endTs.toString(),
    }
  }

  static fromJSON(obj: StakeArgsJSON): StakeArgs {
    return new StakeArgs({
      amount: new BN(obj.amount),
      endTs: new BN(obj.endTs),
    })
  }

  toEncodable() {
    return StakeArgs.toEncodable(this)
  }
}
