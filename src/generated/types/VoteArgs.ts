import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface VoteArgsFields {
  choice: number
}

export interface VoteArgsJSON {
  choice: number
}

export class VoteArgs {
  readonly choice: number

  constructor(fields: VoteArgsFields) {
    this.choice = fields.choice
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u8("choice")], property)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new VoteArgs({
      choice: obj.choice,
    })
  }

  static toEncodable(fields: VoteArgsFields) {
    return {
      choice: fields.choice,
    }
  }

  toJSON(): VoteArgsJSON {
    return {
      choice: this.choice,
    }
  }

  static fromJSON(obj: VoteArgsJSON): VoteArgs {
    return new VoteArgs({
      choice: obj.choice,
    })
  }

  toEncodable() {
    return VoteArgs.toEncodable(this)
  }
}
