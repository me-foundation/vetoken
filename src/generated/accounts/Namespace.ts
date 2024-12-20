import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface NamespaceFields {
  tokenMint: PublicKey
  deployer: PublicKey
  securityCouncil: PublicKey
  reviewCouncil: PublicKey
  overrideNow: BN
  lockupDefaultTargetRewardsPct: number
  lockupDefaultTargetVotingPct: number
  lockupMinDuration: BN
  lockupMinAmount: BN
  lockupMaxSaturation: BN
  proposalMinVotingPowerForQuorum: BN
  proposalMinPassPct: number
  proposalCanUpdateAfterVotes: boolean
  lockupAmount: BN
  proposalNonce: number
  padding: Array<number>
}

export interface NamespaceJSON {
  tokenMint: string
  deployer: string
  securityCouncil: string
  reviewCouncil: string
  overrideNow: string
  lockupDefaultTargetRewardsPct: number
  lockupDefaultTargetVotingPct: number
  lockupMinDuration: string
  lockupMinAmount: string
  lockupMaxSaturation: string
  proposalMinVotingPowerForQuorum: string
  proposalMinPassPct: number
  proposalCanUpdateAfterVotes: boolean
  lockupAmount: string
  proposalNonce: number
  padding: Array<number>
}

export class Namespace {
  readonly tokenMint: PublicKey
  readonly deployer: PublicKey
  readonly securityCouncil: PublicKey
  readonly reviewCouncil: PublicKey
  readonly overrideNow: BN
  readonly lockupDefaultTargetRewardsPct: number
  readonly lockupDefaultTargetVotingPct: number
  readonly lockupMinDuration: BN
  readonly lockupMinAmount: BN
  readonly lockupMaxSaturation: BN
  readonly proposalMinVotingPowerForQuorum: BN
  readonly proposalMinPassPct: number
  readonly proposalCanUpdateAfterVotes: boolean
  readonly lockupAmount: BN
  readonly proposalNonce: number
  readonly padding: Array<number>

  static readonly discriminator = Buffer.from([
    41, 55, 77, 19, 60, 94, 223, 107,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("tokenMint"),
    borsh.publicKey("deployer"),
    borsh.publicKey("securityCouncil"),
    borsh.publicKey("reviewCouncil"),
    borsh.i64("overrideNow"),
    borsh.u16("lockupDefaultTargetRewardsPct"),
    borsh.u16("lockupDefaultTargetVotingPct"),
    borsh.i64("lockupMinDuration"),
    borsh.u64("lockupMinAmount"),
    borsh.u64("lockupMaxSaturation"),
    borsh.u64("proposalMinVotingPowerForQuorum"),
    borsh.u16("proposalMinPassPct"),
    borsh.bool("proposalCanUpdateAfterVotes"),
    borsh.u64("lockupAmount"),
    borsh.u32("proposalNonce"),
    borsh.array(borsh.u8(), 240, "padding"),
  ])

  constructor(fields: NamespaceFields) {
    this.tokenMint = fields.tokenMint
    this.deployer = fields.deployer
    this.securityCouncil = fields.securityCouncil
    this.reviewCouncil = fields.reviewCouncil
    this.overrideNow = fields.overrideNow
    this.lockupDefaultTargetRewardsPct = fields.lockupDefaultTargetRewardsPct
    this.lockupDefaultTargetVotingPct = fields.lockupDefaultTargetVotingPct
    this.lockupMinDuration = fields.lockupMinDuration
    this.lockupMinAmount = fields.lockupMinAmount
    this.lockupMaxSaturation = fields.lockupMaxSaturation
    this.proposalMinVotingPowerForQuorum =
      fields.proposalMinVotingPowerForQuorum
    this.proposalMinPassPct = fields.proposalMinPassPct
    this.proposalCanUpdateAfterVotes = fields.proposalCanUpdateAfterVotes
    this.lockupAmount = fields.lockupAmount
    this.proposalNonce = fields.proposalNonce
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
      reviewCouncil: dec.reviewCouncil,
      overrideNow: dec.overrideNow,
      lockupDefaultTargetRewardsPct: dec.lockupDefaultTargetRewardsPct,
      lockupDefaultTargetVotingPct: dec.lockupDefaultTargetVotingPct,
      lockupMinDuration: dec.lockupMinDuration,
      lockupMinAmount: dec.lockupMinAmount,
      lockupMaxSaturation: dec.lockupMaxSaturation,
      proposalMinVotingPowerForQuorum: dec.proposalMinVotingPowerForQuorum,
      proposalMinPassPct: dec.proposalMinPassPct,
      proposalCanUpdateAfterVotes: dec.proposalCanUpdateAfterVotes,
      lockupAmount: dec.lockupAmount,
      proposalNonce: dec.proposalNonce,
      padding: dec.padding,
    })
  }

  toJSON(): NamespaceJSON {
    return {
      tokenMint: this.tokenMint.toString(),
      deployer: this.deployer.toString(),
      securityCouncil: this.securityCouncil.toString(),
      reviewCouncil: this.reviewCouncil.toString(),
      overrideNow: this.overrideNow.toString(),
      lockupDefaultTargetRewardsPct: this.lockupDefaultTargetRewardsPct,
      lockupDefaultTargetVotingPct: this.lockupDefaultTargetVotingPct,
      lockupMinDuration: this.lockupMinDuration.toString(),
      lockupMinAmount: this.lockupMinAmount.toString(),
      lockupMaxSaturation: this.lockupMaxSaturation.toString(),
      proposalMinVotingPowerForQuorum:
        this.proposalMinVotingPowerForQuorum.toString(),
      proposalMinPassPct: this.proposalMinPassPct,
      proposalCanUpdateAfterVotes: this.proposalCanUpdateAfterVotes,
      lockupAmount: this.lockupAmount.toString(),
      proposalNonce: this.proposalNonce,
      padding: this.padding,
    }
  }

  static fromJSON(obj: NamespaceJSON): Namespace {
    return new Namespace({
      tokenMint: new PublicKey(obj.tokenMint),
      deployer: new PublicKey(obj.deployer),
      securityCouncil: new PublicKey(obj.securityCouncil),
      reviewCouncil: new PublicKey(obj.reviewCouncil),
      overrideNow: new BN(obj.overrideNow),
      lockupDefaultTargetRewardsPct: obj.lockupDefaultTargetRewardsPct,
      lockupDefaultTargetVotingPct: obj.lockupDefaultTargetVotingPct,
      lockupMinDuration: new BN(obj.lockupMinDuration),
      lockupMinAmount: new BN(obj.lockupMinAmount),
      lockupMaxSaturation: new BN(obj.lockupMaxSaturation),
      proposalMinVotingPowerForQuorum: new BN(
        obj.proposalMinVotingPowerForQuorum
      ),
      proposalMinPassPct: obj.proposalMinPassPct,
      proposalCanUpdateAfterVotes: obj.proposalCanUpdateAfterVotes,
      lockupAmount: new BN(obj.lockupAmount),
      proposalNonce: obj.proposalNonce,
      padding: obj.padding,
    })
  }
}
