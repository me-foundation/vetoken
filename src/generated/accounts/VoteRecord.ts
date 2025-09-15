import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface VoteRecordFields {
  ns: PublicKey
  owner: PublicKey
  proposal: PublicKey
  lockup: PublicKey
  choice: number
  votingPower: BN
  padding: Array<number>
}

export interface VoteRecordJSON {
  ns: string
  owner: string
  proposal: string
  lockup: string
  choice: number
  votingPower: string
  padding: Array<number>
}

export class VoteRecord {
  readonly ns: PublicKey
  readonly owner: PublicKey
  readonly proposal: PublicKey
  readonly lockup: PublicKey
  readonly choice: number
  readonly votingPower: BN
  readonly padding: Array<number>

  static readonly discriminator = Buffer.from([
    112, 9, 123, 165, 234, 9, 157, 167,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("ns"),
    borsh.publicKey("owner"),
    borsh.publicKey("proposal"),
    borsh.publicKey("lockup"),
    borsh.u8("choice"),
    borsh.u64("votingPower"),
    borsh.array(borsh.u8(), 32, "padding"),
  ])

  constructor(fields: VoteRecordFields) {
    this.ns = fields.ns
    this.owner = fields.owner
    this.proposal = fields.proposal
    this.lockup = fields.lockup
    this.choice = fields.choice
    this.votingPower = fields.votingPower
    this.padding = fields.padding
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<VoteRecord | null> {
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
  ): Promise<Array<VoteRecord | null>> {
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

  static decode(data: Buffer): VoteRecord {
    if (!data.slice(0, 8).equals(VoteRecord.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = VoteRecord.layout.decode(data.slice(8))

    return new VoteRecord({
      ns: dec.ns,
      owner: dec.owner,
      proposal: dec.proposal,
      lockup: dec.lockup,
      choice: dec.choice,
      votingPower: dec.votingPower,
      padding: dec.padding,
    })
  }

  toJSON(): VoteRecordJSON {
    return {
      ns: this.ns.toString(),
      owner: this.owner.toString(),
      proposal: this.proposal.toString(),
      lockup: this.lockup.toString(),
      choice: this.choice,
      votingPower: this.votingPower.toString(),
      padding: this.padding,
    }
  }

  static fromJSON(obj: VoteRecordJSON): VoteRecord {
    return new VoteRecord({
      ns: new PublicKey(obj.ns),
      owner: new PublicKey(obj.owner),
      proposal: new PublicKey(obj.proposal),
      lockup: new PublicKey(obj.lockup),
      choice: obj.choice,
      votingPower: new BN(obj.votingPower),
      padding: obj.padding,
    })
  }
}
