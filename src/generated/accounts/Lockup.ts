import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface LockupFields {
  ns: PublicKey
  owner: PublicKey
  amount: BN
  startTs: BN
  endTs: BN
  targetRewardsBp: number
  targetVotingBp: number
  padding: Array<number>
}

export interface LockupJSON {
  ns: string
  owner: string
  amount: string
  startTs: string
  endTs: string
  targetRewardsBp: number
  targetVotingBp: number
  padding: Array<number>
}

export class Lockup {
  readonly ns: PublicKey
  readonly owner: PublicKey
  readonly amount: BN
  readonly startTs: BN
  readonly endTs: BN
  readonly targetRewardsBp: number
  readonly targetVotingBp: number
  readonly padding: Array<number>

  static readonly discriminator = Buffer.from([1, 45, 32, 32, 57, 81, 88, 67])

  static readonly layout = borsh.struct([
    borsh.publicKey("ns"),
    borsh.publicKey("owner"),
    borsh.u64("amount"),
    borsh.i64("startTs"),
    borsh.i64("endTs"),
    borsh.u16("targetRewardsBp"),
    borsh.u16("targetVotingBp"),
    borsh.array(borsh.u8(), 240, "padding"),
  ])

  constructor(fields: LockupFields) {
    this.ns = fields.ns
    this.owner = fields.owner
    this.amount = fields.amount
    this.startTs = fields.startTs
    this.endTs = fields.endTs
    this.targetRewardsBp = fields.targetRewardsBp
    this.targetVotingBp = fields.targetVotingBp
    this.padding = fields.padding
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<Lockup | null> {
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
  ): Promise<Array<Lockup | null>> {
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

  static decode(data: Buffer): Lockup {
    if (!data.slice(0, 8).equals(Lockup.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = Lockup.layout.decode(data.slice(8))

    return new Lockup({
      ns: dec.ns,
      owner: dec.owner,
      amount: dec.amount,
      startTs: dec.startTs,
      endTs: dec.endTs,
      targetRewardsBp: dec.targetRewardsBp,
      targetVotingBp: dec.targetVotingBp,
      padding: dec.padding,
    })
  }

  toJSON(): LockupJSON {
    return {
      ns: this.ns.toString(),
      owner: this.owner.toString(),
      amount: this.amount.toString(),
      startTs: this.startTs.toString(),
      endTs: this.endTs.toString(),
      targetRewardsBp: this.targetRewardsBp,
      targetVotingBp: this.targetVotingBp,
      padding: this.padding,
    }
  }

  static fromJSON(obj: LockupJSON): Lockup {
    return new Lockup({
      ns: new PublicKey(obj.ns),
      owner: new PublicKey(obj.owner),
      amount: new BN(obj.amount),
      startTs: new BN(obj.startTs),
      endTs: new BN(obj.endTs),
      targetRewardsBp: obj.targetRewardsBp,
      targetVotingBp: obj.targetVotingBp,
      padding: obj.padding,
    })
  }
}
