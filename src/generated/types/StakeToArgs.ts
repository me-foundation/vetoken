import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface StakeToArgsFields {
  amount: BN
  endTs: BN
  disableRewardsBp: boolean
}

export interface StakeToArgsJSON {
  amount: string
  endTs: string
  disableRewardsBp: boolean
}

export class StakeToArgs {
  readonly amount: BN
  readonly endTs: BN
  readonly disableRewardsBp: boolean

  constructor(fields: StakeToArgsFields) {
    this.amount = fields.amount
    this.endTs = fields.endTs
    this.disableRewardsBp = fields.disableRewardsBp
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u64("amount"), borsh.i64("endTs"), borsh.bool("disableRewardsBp")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new StakeToArgs({
      amount: obj.amount,
      endTs: obj.endTs,
      disableRewardsBp: obj.disableRewardsBp,
    })
  }

  static toEncodable(fields: StakeToArgsFields) {
    return {
      amount: fields.amount,
      endTs: fields.endTs,
      disableRewardsBp: fields.disableRewardsBp,
    }
  }

  toJSON(): StakeToArgsJSON {
    return {
      amount: this.amount.toString(),
      endTs: this.endTs.toString(),
      disableRewardsBp: this.disableRewardsBp,
    }
  }

  static fromJSON(obj: StakeToArgsJSON): StakeToArgs {
    return new StakeToArgs({
      amount: new BN(obj.amount),
      endTs: new BN(obj.endTs),
      disableRewardsBp: obj.disableRewardsBp,
    })
  }

  toEncodable() {
    return StakeToArgs.toEncodable(this)
  }
}
