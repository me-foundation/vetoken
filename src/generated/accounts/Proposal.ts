import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ProposalFields {
  ns: PublicKey
  nonce: number
  owner: PublicKey
  startTs: BN
  endTs: BN
  status: number
  votingPowerChoices: Array<BN>
  uri: string
  padding: Array<number>
}

export interface ProposalJSON {
  ns: string
  nonce: number
  owner: string
  startTs: string
  endTs: string
  status: number
  votingPowerChoices: Array<string>
  uri: string
  padding: Array<number>
}

export class Proposal {
  readonly ns: PublicKey
  readonly nonce: number
  readonly owner: PublicKey
  readonly startTs: BN
  readonly endTs: BN
  readonly status: number
  readonly votingPowerChoices: Array<BN>
  readonly uri: string
  readonly padding: Array<number>

  static readonly discriminator = Buffer.from([
    26, 94, 189, 187, 116, 136, 53, 33,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("ns"),
    borsh.u32("nonce"),
    borsh.publicKey("owner"),
    borsh.i64("startTs"),
    borsh.i64("endTs"),
    borsh.u8("status"),
    borsh.array(borsh.u64(), 6, "votingPowerChoices"),
    borsh.str("uri"),
    borsh.array(borsh.u8(), 240, "padding"),
  ])

  constructor(fields: ProposalFields) {
    this.ns = fields.ns
    this.nonce = fields.nonce
    this.owner = fields.owner
    this.startTs = fields.startTs
    this.endTs = fields.endTs
    this.status = fields.status
    this.votingPowerChoices = fields.votingPowerChoices
    this.uri = fields.uri
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
      startTs: dec.startTs,
      endTs: dec.endTs,
      status: dec.status,
      votingPowerChoices: dec.votingPowerChoices,
      uri: dec.uri,
      padding: dec.padding,
    })
  }

  toJSON(): ProposalJSON {
    return {
      ns: this.ns.toString(),
      nonce: this.nonce,
      owner: this.owner.toString(),
      startTs: this.startTs.toString(),
      endTs: this.endTs.toString(),
      status: this.status,
      votingPowerChoices: this.votingPowerChoices.map((item) =>
        item.toString()
      ),
      uri: this.uri,
      padding: this.padding,
    }
  }

  static fromJSON(obj: ProposalJSON): Proposal {
    return new Proposal({
      ns: new PublicKey(obj.ns),
      nonce: obj.nonce,
      owner: new PublicKey(obj.owner),
      startTs: new BN(obj.startTs),
      endTs: new BN(obj.endTs),
      status: obj.status,
      votingPowerChoices: obj.votingPowerChoices.map((item) => new BN(item)),
      uri: obj.uri,
      padding: obj.padding,
    })
  }
}
