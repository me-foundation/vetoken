import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface NamespaceFields {
  tokenMint: PublicKey
  deployer: PublicKey
  securityCouncil: PublicKey
  lockupAmount: BN
  proposalNonce: number
  debugTsOffset: BN
  padding: Array<number>
}

export interface NamespaceJSON {
  tokenMint: string
  deployer: string
  securityCouncil: string
  lockupAmount: string
  proposalNonce: number
  debugTsOffset: string
  padding: Array<number>
}

export class Namespace {
  readonly tokenMint: PublicKey
  readonly deployer: PublicKey
  readonly securityCouncil: PublicKey
  readonly lockupAmount: BN
  readonly proposalNonce: number
  readonly debugTsOffset: BN
  readonly padding: Array<number>

  static readonly discriminator = Buffer.from([
    41, 55, 77, 19, 60, 94, 223, 107,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("tokenMint"),
    borsh.publicKey("deployer"),
    borsh.publicKey("securityCouncil"),
    borsh.u64("lockupAmount"),
    borsh.u32("proposalNonce"),
    borsh.i64("debugTsOffset"),
    borsh.array(borsh.u8(), 240, "padding"),
  ])

  constructor(fields: NamespaceFields) {
    this.tokenMint = fields.tokenMint
    this.deployer = fields.deployer
    this.securityCouncil = fields.securityCouncil
    this.lockupAmount = fields.lockupAmount
    this.proposalNonce = fields.proposalNonce
    this.debugTsOffset = fields.debugTsOffset
    this.padding = fields.padding
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<Namespace | null> {
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
  ): Promise<Array<Namespace | null>> {
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

  static decode(data: Buffer): Namespace {
    if (!data.slice(0, 8).equals(Namespace.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = Namespace.layout.decode(data.slice(8))

    return new Namespace({
      tokenMint: dec.tokenMint,
      deployer: dec.deployer,
      securityCouncil: dec.securityCouncil,
      lockupAmount: dec.lockupAmount,
      proposalNonce: dec.proposalNonce,
      debugTsOffset: dec.debugTsOffset,
      padding: dec.padding,
    })
  }

  toJSON(): NamespaceJSON {
    return {
      tokenMint: this.tokenMint.toString(),
      deployer: this.deployer.toString(),
      securityCouncil: this.securityCouncil.toString(),
      lockupAmount: this.lockupAmount.toString(),
      proposalNonce: this.proposalNonce,
      debugTsOffset: this.debugTsOffset.toString(),
      padding: this.padding,
    }
  }

  static fromJSON(obj: NamespaceJSON): Namespace {
    return new Namespace({
      tokenMint: new PublicKey(obj.tokenMint),
      deployer: new PublicKey(obj.deployer),
      securityCouncil: new PublicKey(obj.securityCouncil),
      lockupAmount: new BN(obj.lockupAmount),
      proposalNonce: obj.proposalNonce,
      debugTsOffset: new BN(obj.debugTsOffset),
      padding: obj.padding,
    })
  }
}
