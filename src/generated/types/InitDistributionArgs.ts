import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface InitDistributionArgsFields {
  cosigner1: PublicKey
  cosigner2: PublicKey
  startTs: BN
}

export interface InitDistributionArgsJSON {
  cosigner1: string
  cosigner2: string
  startTs: string
}

export class InitDistributionArgs {
  readonly cosigner1: PublicKey
  readonly cosigner2: PublicKey
  readonly startTs: BN

  constructor(fields: InitDistributionArgsFields) {
    this.cosigner1 = fields.cosigner1
    this.cosigner2 = fields.cosigner2
    this.startTs = fields.startTs
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.publicKey("cosigner1"),
        borsh.publicKey("cosigner2"),
        borsh.i64("startTs"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new InitDistributionArgs({
      cosigner1: obj.cosigner1,
      cosigner2: obj.cosigner2,
      startTs: obj.startTs,
    })
  }

  static toEncodable(fields: InitDistributionArgsFields) {
    return {
      cosigner1: fields.cosigner1,
      cosigner2: fields.cosigner2,
      startTs: fields.startTs,
    }
  }

  toJSON(): InitDistributionArgsJSON {
    return {
      cosigner1: this.cosigner1.toString(),
      cosigner2: this.cosigner2.toString(),
      startTs: this.startTs.toString(),
    }
  }

  static fromJSON(obj: InitDistributionArgsJSON): InitDistributionArgs {
    return new InitDistributionArgs({
      cosigner1: new PublicKey(obj.cosigner1),
      cosigner2: new PublicKey(obj.cosigner2),
      startTs: new BN(obj.startTs),
    })
  }

  toEncodable() {
    return InitDistributionArgs.toEncodable(this)
  }
}
