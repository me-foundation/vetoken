import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface InitProposalArgsFields {
  startTs: BN
  endTs: BN
  uri: string
}

export interface InitProposalArgsJSON {
  startTs: string
  endTs: string
  uri: string
}

export class InitProposalArgs {
  readonly startTs: BN
  readonly endTs: BN
  readonly uri: string

  constructor(fields: InitProposalArgsFields) {
    this.startTs = fields.startTs
    this.endTs = fields.endTs
    this.uri = fields.uri
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.i64("startTs"), borsh.i64("endTs"), borsh.str("uri")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new InitProposalArgs({
      startTs: obj.startTs,
      endTs: obj.endTs,
      uri: obj.uri,
    })
  }

  static toEncodable(fields: InitProposalArgsFields) {
    return {
      startTs: fields.startTs,
      endTs: fields.endTs,
      uri: fields.uri,
    }
  }

  toJSON(): InitProposalArgsJSON {
    return {
      startTs: this.startTs.toString(),
      endTs: this.endTs.toString(),
      uri: this.uri,
    }
  }

  static fromJSON(obj: InitProposalArgsJSON): InitProposalArgs {
    return new InitProposalArgs({
      startTs: new BN(obj.startTs),
      endTs: new BN(obj.endTs),
      uri: obj.uri,
    })
  }

  toEncodable() {
    return InitProposalArgs.toEncodable(this)
  }
}
