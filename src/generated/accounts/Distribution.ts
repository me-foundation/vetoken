import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface DistributionFields {
  ns: PublicKey
  uuid: PublicKey
  cosigner1: PublicKey
  cosigner2: PublicKey
  startTs: BN
  distributionTokenMint: PublicKey
  padding: Array<number>
}

export interface DistributionJSON {
  ns: string
  uuid: string
  cosigner1: string
  cosigner2: string
  startTs: string
  distributionTokenMint: string
  padding: Array<number>
}

export class Distribution {
  readonly ns: PublicKey
  readonly uuid: PublicKey
  readonly cosigner1: PublicKey
  readonly cosigner2: PublicKey
  readonly startTs: BN
  readonly distributionTokenMint: PublicKey
  readonly padding: Array<number>

  static readonly discriminator = Buffer.from([176, 85, 17, 11, 13, 194, 18, 1])

  static readonly layout = borsh.struct([
    borsh.publicKey("ns"),
    borsh.publicKey("uuid"),
    borsh.publicKey("cosigner1"),
    borsh.publicKey("cosigner2"),
    borsh.i64("startTs"),
    borsh.publicKey("distributionTokenMint"),
    borsh.array(borsh.u8(), 240, "padding"),
  ])

  constructor(fields: DistributionFields) {
    this.ns = fields.ns
    this.uuid = fields.uuid
    this.cosigner1 = fields.cosigner1
    this.cosigner2 = fields.cosigner2
    this.startTs = fields.startTs
    this.distributionTokenMint = fields.distributionTokenMint
    this.padding = fields.padding
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<Distribution | null> {
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
  ): Promise<Array<Distribution | null>> {
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

  static decode(data: Buffer): Distribution {
    if (!data.slice(0, 8).equals(Distribution.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = Distribution.layout.decode(data.slice(8))

    return new Distribution({
      ns: dec.ns,
      uuid: dec.uuid,
      cosigner1: dec.cosigner1,
      cosigner2: dec.cosigner2,
      startTs: dec.startTs,
      distributionTokenMint: dec.distributionTokenMint,
      padding: dec.padding,
    })
  }

  toJSON(): DistributionJSON {
    return {
      ns: this.ns.toString(),
      uuid: this.uuid.toString(),
      cosigner1: this.cosigner1.toString(),
      cosigner2: this.cosigner2.toString(),
      startTs: this.startTs.toString(),
      distributionTokenMint: this.distributionTokenMint.toString(),
      padding: this.padding,
    }
  }

  static fromJSON(obj: DistributionJSON): Distribution {
    return new Distribution({
      ns: new PublicKey(obj.ns),
      uuid: new PublicKey(obj.uuid),
      cosigner1: new PublicKey(obj.cosigner1),
      cosigner2: new PublicKey(obj.cosigner2),
      startTs: new BN(obj.startTs),
      distributionTokenMint: new PublicKey(obj.distributionTokenMint),
      padding: obj.padding,
    })
  }
}
