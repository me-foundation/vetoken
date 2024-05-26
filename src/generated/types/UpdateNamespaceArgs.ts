import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface UpdateNamespaceArgsFields {
  newSecurityCouncil: PublicKey
  debugTsOffset: BN | null
}

export interface UpdateNamespaceArgsJSON {
  newSecurityCouncil: string
  debugTsOffset: string | null
}

export class UpdateNamespaceArgs {
  readonly newSecurityCouncil: PublicKey
  readonly debugTsOffset: BN | null

  constructor(fields: UpdateNamespaceArgsFields) {
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
    return new UpdateNamespaceArgs({
      newSecurityCouncil: obj.newSecurityCouncil,
      debugTsOffset: obj.debugTsOffset,
    })
  }

  static toEncodable(fields: UpdateNamespaceArgsFields) {
    return {
      newSecurityCouncil: fields.newSecurityCouncil,
      debugTsOffset: fields.debugTsOffset,
    }
  }

  toJSON(): UpdateNamespaceArgsJSON {
    return {
      newSecurityCouncil: this.newSecurityCouncil.toString(),
      debugTsOffset:
        (this.debugTsOffset && this.debugTsOffset.toString()) || null,
    }
  }

  static fromJSON(obj: UpdateNamespaceArgsJSON): UpdateNamespaceArgs {
    return new UpdateNamespaceArgs({
      newSecurityCouncil: new PublicKey(obj.newSecurityCouncil),
      debugTsOffset: (obj.debugTsOffset && new BN(obj.debugTsOffset)) || null,
    })
  }

  toEncodable() {
    return UpdateNamespaceArgs.toEncodable(this)
  }
}
