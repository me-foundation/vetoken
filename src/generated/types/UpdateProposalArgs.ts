import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface UpdateProposalArgsFields {
  startTs: BN
  endTs: BN
  uri: string
}

export interface UpdateProposalArgsJSON {
  startTs: string
  endTs: string
  uri: string
}

export class UpdateProposalArgs {
  readonly startTs: BN
  readonly endTs: BN
  readonly uri: string

  constructor(fields: UpdateProposalArgsFields) {
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
    return new UpdateProposalArgs({
      startTs: obj.startTs,
      endTs: obj.endTs,
      uri: obj.uri,
    })
  }

  static toEncodable(fields: UpdateProposalArgsFields) {
    return {
      startTs: fields.startTs,
      endTs: fields.endTs,
      uri: fields.uri,
    }
  }

  toJSON(): UpdateProposalArgsJSON {
    return {
      startTs: this.startTs.toString(),
      endTs: this.endTs.toString(),
      uri: this.uri,
    }
  }

  static fromJSON(obj: UpdateProposalArgsJSON): UpdateProposalArgs {
    return new UpdateProposalArgs({
      startTs: new BN(obj.startTs),
      endTs: new BN(obj.endTs),
      uri: obj.uri,
    })
  }

  toEncodable() {
    return UpdateProposalArgs.toEncodable(this)
  }
}
