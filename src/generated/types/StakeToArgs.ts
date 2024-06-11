import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface StakeToArgsFields {
  amount: BN
  endTs: BN
  disableRewards: boolean
}

export interface StakeToArgsJSON {
  amount: string
  endTs: string
  disableRewards: boolean
}

export class StakeToArgs {
  readonly amount: BN
  readonly endTs: BN
  readonly disableRewards: boolean

  constructor(fields: StakeToArgsFields) {
    this.amount = fields.amount
    this.endTs = fields.endTs
    this.disableRewards = fields.disableRewards
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u64("amount"), borsh.i64("endTs"), borsh.bool("disableRewards")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new StakeToArgs({
      amount: obj.amount,
      endTs: obj.endTs,
      disableRewards: obj.disableRewards,
    })
  }

  static toEncodable(fields: StakeToArgsFields) {
    return {
      amount: fields.amount,
      endTs: fields.endTs,
      disableRewards: fields.disableRewards,
    }
  }

  toJSON(): StakeToArgsJSON {
    return {
      amount: this.amount.toString(),
      endTs: this.endTs.toString(),
      disableRewards: this.disableRewards,
    }
  }

  static fromJSON(obj: StakeToArgsJSON): StakeToArgs {
    return new StakeToArgs({
      amount: new BN(obj.amount),
      endTs: new BN(obj.endTs),
      disableRewards: obj.disableRewards,
    })
  }

  toEncodable() {
    return StakeToArgs.toEncodable(this)
  }
}
