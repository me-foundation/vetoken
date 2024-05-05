import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface UpdateProposalArgsFields {
  uri: Array<number>
  startTs: BN
  endTs: BN
}

export interface UpdateProposalArgsJSON {
  uri: Array<number>
  startTs: string
  endTs: string
}

export class UpdateProposalArgs {
  readonly uri: Array<number>
  readonly startTs: BN
  readonly endTs: BN

  constructor(fields: UpdateProposalArgsFields) {
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
    return new UpdateProposalArgs({
      uri: obj.uri,
      startTs: obj.startTs,
      endTs: obj.endTs,
    })
  }

  static toEncodable(fields: UpdateProposalArgsFields) {
    return {
      uri: fields.uri,
      startTs: fields.startTs,
      endTs: fields.endTs,
    }
  }

  toJSON(): UpdateProposalArgsJSON {
    return {
      uri: this.uri,
      startTs: this.startTs.toString(),
      endTs: this.endTs.toString(),
    }
  }

  static fromJSON(obj: UpdateProposalArgsJSON): UpdateProposalArgs {
    return new UpdateProposalArgs({
      uri: obj.uri,
      startTs: new BN(obj.startTs),
      endTs: new BN(obj.endTs),
    })
  }

  toEncodable() {
    return UpdateProposalArgs.toEncodable(this)
  }
}
