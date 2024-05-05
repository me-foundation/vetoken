import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface GlobalFields {
  lockupAmount: BN
  proposalNonce: number
  securityCouncil: PublicKey
  debugTsOffset: BN
  padding: Array<number>
}

export interface GlobalJSON {
  lockupAmount: string
  proposalNonce: number
  securityCouncil: string
  debugTsOffset: string
  padding: Array<number>
}

export class Global {
  readonly lockupAmount: BN
  readonly proposalNonce: number
  readonly securityCouncil: PublicKey
  readonly debugTsOffset: BN
  readonly padding: Array<number>

  static readonly discriminator = Buffer.from([
    167, 232, 232, 177, 200, 108, 114, 127,
  ])

  static readonly layout = borsh.struct([
    borsh.u64("lockupAmount"),
    borsh.u32("proposalNonce"),
    borsh.publicKey("securityCouncil"),
    borsh.i64("debugTsOffset"),
    borsh.array(borsh.u8(), 240, "padding"),
  ])

  constructor(fields: GlobalFields) {
    this.lockupAmount = fields.lockupAmount
    this.proposalNonce = fields.proposalNonce
    this.securityCouncil = fields.securityCouncil
    this.debugTsOffset = fields.debugTsOffset
    this.padding = fields.padding
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<Global | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }
    if (!info.owner.equals(programId)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[],
    programId: PublicKey = PROGRAM_ID
  ): Promise<Array<Global | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(programId)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): Global {
    if (!data.slice(0, 8).equals(Global.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = Global.layout.decode(data.slice(8))

    return new Global({
      lockupAmount: dec.lockupAmount,
      proposalNonce: dec.proposalNonce,
      securityCouncil: dec.securityCouncil,
      debugTsOffset: dec.debugTsOffset,
      padding: dec.padding,
    })
  }

  toJSON(): GlobalJSON {
    return {
      lockupAmount: this.lockupAmount.toString(),
      proposalNonce: this.proposalNonce,
      securityCouncil: this.securityCouncil.toString(),
      debugTsOffset: this.debugTsOffset.toString(),
      padding: this.padding,
    }
  }

  static fromJSON(obj: GlobalJSON): Global {
    return new Global({
      lockupAmount: new BN(obj.lockupAmount),
      proposalNonce: obj.proposalNonce,
      securityCouncil: new PublicKey(obj.securityCouncil),
      debugTsOffset: new BN(obj.debugTsOffset),
      padding: obj.padding,
    })
  }
}
