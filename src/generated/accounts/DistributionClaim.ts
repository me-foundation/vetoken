import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface DistributionClaimFields {
  ns: PublicKey
  distribution: PublicKey
  claimant: PublicKey
  distributionTokenMint: PublicKey
  amount: BN
  cosignedMsg: Array<number>
  padding: Array<number>
}

export interface DistributionClaimJSON {
  ns: string
  distribution: string
  claimant: string
  distributionTokenMint: string
  amount: string
  cosignedMsg: Array<number>
  padding: Array<number>
}

export class DistributionClaim {
  readonly ns: PublicKey
  readonly distribution: PublicKey
  readonly claimant: PublicKey
  readonly distributionTokenMint: PublicKey
  readonly amount: BN
  readonly cosignedMsg: Array<number>
  readonly padding: Array<number>

  static readonly discriminator = Buffer.from([
    239, 137, 48, 156, 94, 143, 205, 29,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("ns"),
    borsh.publicKey("distribution"),
    borsh.publicKey("claimant"),
    borsh.publicKey("distributionTokenMint"),
    borsh.u64("amount"),
    borsh.array(borsh.u8(), 32, "cosignedMsg"),
    borsh.array(borsh.u8(), 240, "padding"),
  ])

  constructor(fields: DistributionClaimFields) {
    this.ns = fields.ns
    this.distribution = fields.distribution
    this.claimant = fields.claimant
    this.distributionTokenMint = fields.distributionTokenMint
    this.amount = fields.amount
    this.cosignedMsg = fields.cosignedMsg
    this.padding = fields.padding
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<DistributionClaim | null> {
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
  ): Promise<Array<DistributionClaim | null>> {
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

  static decode(data: Buffer): DistributionClaim {
    if (!data.slice(0, 8).equals(DistributionClaim.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = DistributionClaim.layout.decode(data.slice(8))

    return new DistributionClaim({
      ns: dec.ns,
      distribution: dec.distribution,
      claimant: dec.claimant,
      distributionTokenMint: dec.distributionTokenMint,
      amount: dec.amount,
      cosignedMsg: dec.cosignedMsg,
      padding: dec.padding,
    })
  }

  toJSON(): DistributionClaimJSON {
    return {
      ns: this.ns.toString(),
      distribution: this.distribution.toString(),
      claimant: this.claimant.toString(),
      distributionTokenMint: this.distributionTokenMint.toString(),
      amount: this.amount.toString(),
      cosignedMsg: this.cosignedMsg,
      padding: this.padding,
    }
  }

  static fromJSON(obj: DistributionClaimJSON): DistributionClaim {
    return new DistributionClaim({
      ns: new PublicKey(obj.ns),
      distribution: new PublicKey(obj.distribution),
      claimant: new PublicKey(obj.claimant),
      distributionTokenMint: new PublicKey(obj.distributionTokenMint),
      amount: new BN(obj.amount),
      cosignedMsg: obj.cosignedMsg,
      padding: obj.padding,
    })
  }
}
