import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface InitProposalArgsFields {
  uri: Array<number>
  startTs: BN
  endTs: BN
}

export interface InitProposalArgsJSON {
  uri: Array<number>
  startTs: string
  endTs: string
}

export class InitProposalArgs {
  readonly uri: Array<number>
  readonly startTs: BN
  readonly endTs: BN

  constructor(fields: InitProposalArgsFields) {
    this.uri = fields.uri
    this.startTs = fields.startTs
    this.endTs = fields.endTs
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.array(borsh.u8(), 256, "uri"),
        borsh.i64("startTs"),
        borsh.i64("endTs"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new InitProposalArgs({
      uri: obj.uri,
      startTs: obj.startTs,
      endTs: obj.endTs,
    })
  }

  static toEncodable(fields: InitProposalArgsFields) {
    return {
      uri: fields.uri,
      startTs: fields.startTs,
      endTs: fields.endTs,
    }
  }

  toJSON(): InitProposalArgsJSON {
    return {
      uri: this.uri,
      startTs: this.startTs.toString(),
      endTs: this.endTs.toString(),
    }
  }

  static fromJSON(obj: InitProposalArgsJSON): InitProposalArgs {
    return new InitProposalArgs({
      uri: obj.uri,
      startTs: new BN(obj.startTs),
      endTs: new BN(obj.endTs),
    })
  }

  toEncodable() {
    return InitProposalArgs.toEncodable(this)
  }
}
