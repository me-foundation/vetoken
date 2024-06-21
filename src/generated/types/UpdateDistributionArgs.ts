import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface UpdateDistributionArgsFields {
  startTs: BN
}

export interface UpdateDistributionArgsJSON {
  startTs: string
}

export class UpdateDistributionArgs {
  readonly startTs: BN

  constructor(fields: UpdateDistributionArgsFields) {
    this.startTs = fields.startTs
  }

  static layout(property?: string) {
    return borsh.struct([borsh.i64("startTs")], property)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new UpdateDistributionArgs({
      startTs: obj.startTs,
    })
  }

  static toEncodable(fields: UpdateDistributionArgsFields) {
    return {
      startTs: fields.startTs,
    }
  }

  toJSON(): UpdateDistributionArgsJSON {
    return {
      startTs: this.startTs.toString(),
    }
  }

  static fromJSON(obj: UpdateDistributionArgsJSON): UpdateDistributionArgs {
    return new UpdateDistributionArgs({
      startTs: new BN(obj.startTs),
    })
  }

  toEncodable() {
    return UpdateDistributionArgs.toEncodable(this)
  }
}
