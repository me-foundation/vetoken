import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ProposalFields {
  ns: PublicKey
  nonce: number
  owner: PublicKey
  uri: Array<number>
  startTs: BN
  endTs: BN
  status: number
  numChoice0: BN
  numChoice1: BN
  numChoice2: BN
  numChoice3: BN
  numChoice4: BN
  numChoice5: BN
  padding: Array<number>
}

export interface ProposalJSON {
  ns: string
  nonce: number
  owner: string
  uri: Array<number>
  startTs: string
  endTs: string
  status: number
  numChoice0: string
  numChoice1: string
  numChoice2: string
  numChoice3: string
  numChoice4: string
  numChoice5: string
  padding: Array<number>
}

export class Proposal {
  readonly ns: PublicKey
  readonly nonce: number
  readonly owner: PublicKey
  readonly uri: Array<number>
  readonly startTs: BN
  readonly endTs: BN
  readonly status: number
  readonly numChoice0: BN
  readonly numChoice1: BN
  readonly numChoice2: BN
  readonly numChoice3: BN
  readonly numChoice4: BN
  readonly numChoice5: BN
  readonly padding: Array<number>

  static readonly discriminator = Buffer.from([
    26, 94, 189, 187, 116, 136, 53, 33,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("ns"),
    borsh.u32("nonce"),
    borsh.publicKey("owner"),
    borsh.array(borsh.u8(), 256, "uri"),
    borsh.i64("startTs"),
    borsh.i64("endTs"),
    borsh.u8("status"),
    borsh.u64("numChoice0"),
    borsh.u64("numChoice1"),
    borsh.u64("numChoice2"),
    borsh.u64("numChoice3"),
    borsh.u64("numChoice4"),
    borsh.u64("numChoice5"),
    borsh.array(borsh.u8(), 240, "padding"),
  ])

  constructor(fields: ProposalFields) {
    this.ns = fields.ns
    this.nonce = fields.nonce
    this.owner = fields.owner
    this.uri = fields.uri
    this.startTs = fields.startTs
    this.endTs = fields.endTs
    this.status = fields.status
    this.numChoice0 = fields.numChoice0
    this.numChoice1 = fields.numChoice1
    this.numChoice2 = fields.numChoice2
    this.numChoice3 = fields.numChoice3
    this.numChoice4 = fields.numChoice4
    this.numChoice5 = fields.numChoice5
    this.padding = fields.padding
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<Proposal | null> {
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
  ): Promise<Array<Proposal | null>> {
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

  static decode(data: Buffer): Proposal {
    if (!data.slice(0, 8).equals(Proposal.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = Proposal.layout.decode(data.slice(8))

    return new Proposal({
      ns: dec.ns,
      nonce: dec.nonce,
      owner: dec.owner,
      uri: dec.uri,
      startTs: dec.startTs,
      endTs: dec.endTs,
      status: dec.status,
      numChoice0: dec.numChoice0,
      numChoice1: dec.numChoice1,
      numChoice2: dec.numChoice2,
      numChoice3: dec.numChoice3,
      numChoice4: dec.numChoice4,
      numChoice5: dec.numChoice5,
      padding: dec.padding,
    })
  }

  toJSON(): ProposalJSON {
    return {
      ns: this.ns.toString(),
      nonce: this.nonce,
      owner: this.owner.toString(),
      uri: this.uri,
      startTs: this.startTs.toString(),
      endTs: this.endTs.toString(),
      status: this.status,
      numChoice0: this.numChoice0.toString(),
      numChoice1: this.numChoice1.toString(),
      numChoice2: this.numChoice2.toString(),
      numChoice3: this.numChoice3.toString(),
      numChoice4: this.numChoice4.toString(),
      numChoice5: this.numChoice5.toString(),
      padding: this.padding,
    }
  }

  static fromJSON(obj: ProposalJSON): Proposal {
    return new Proposal({
      ns: new PublicKey(obj.ns),
      nonce: obj.nonce,
      owner: new PublicKey(obj.owner),
      uri: obj.uri,
      startTs: new BN(obj.startTs),
      endTs: new BN(obj.endTs),
      status: obj.status,
      numChoice0: new BN(obj.numChoice0),
      numChoice1: new BN(obj.numChoice1),
      numChoice2: new BN(obj.numChoice2),
      numChoice3: new BN(obj.numChoice3),
      numChoice4: new BN(obj.numChoice4),
      numChoice5: new BN(obj.numChoice5),
      padding: obj.padding,
    })
  }
}
