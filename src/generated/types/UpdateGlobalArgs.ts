import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface UpdateGlobalArgsFields {
  newSecurityCouncil: PublicKey
  debugTsOffset: BN | null
}

export interface UpdateGlobalArgsJSON {
  newSecurityCouncil: string
  debugTsOffset: string | null
}

export class UpdateGlobalArgs {
  readonly newSecurityCouncil: PublicKey
  readonly debugTsOffset: BN | null

  constructor(fields: UpdateGlobalArgsFields) {
    this.newSecurityCouncil = fields.newSecurityCouncil
    this.debugTsOffset = fields.debugTsOffset
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.publicKey("newSecurityCouncil"),
        borsh.option(borsh.i64(), "debugTsOffset"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new UpdateGlobalArgs({
      newSecurityCouncil: obj.newSecurityCouncil,
      debugTsOffset: obj.debugTsOffset,
    })
  }

  static toEncodable(fields: UpdateGlobalArgsFields) {
    return {
      newSecurityCouncil: fields.newSecurityCouncil,
      debugTsOffset: fields.debugTsOffset,
    }
  }

  toJSON(): UpdateGlobalArgsJSON {
    return {
      newSecurityCouncil: this.newSecurityCouncil.toString(),
      debugTsOffset:
        (this.debugTsOffset && this.debugTsOffset.toString()) || null,
    }
  }

  static fromJSON(obj: UpdateGlobalArgsJSON): UpdateGlobalArgs {
    return new UpdateGlobalArgs({
      newSecurityCouncil: new PublicKey(obj.newSecurityCouncil),
      debugTsOffset: (obj.debugTsOffset && new BN(obj.debugTsOffset)) || null,
    })
  }

  toEncodable() {
    return UpdateGlobalArgs.toEncodable(this)
  }
}
