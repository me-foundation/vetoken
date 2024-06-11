import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface UpdateNamespaceArgsFields {
  securityCouncil: PublicKey
  reviewCouncil: PublicKey
  lockupDefaultTargetRewardsPct: number
  lockupDefaultTargetVotingPct: number
  lockupMinDuration: BN
  lockupMinAmount: BN
  lockupMaxSaturation: BN
  proposalMinVotingPowerForQuorum: BN
  proposalMinPassPct: number
  proposalCanUpdateAfterVotes: boolean
}

export interface UpdateNamespaceArgsJSON {
  securityCouncil: string
  reviewCouncil: string
  lockupDefaultTargetRewardsPct: number
  lockupDefaultTargetVotingPct: number
  lockupMinDuration: string
  lockupMinAmount: string
  lockupMaxSaturation: string
  proposalMinVotingPowerForQuorum: string
  proposalMinPassPct: number
  proposalCanUpdateAfterVotes: boolean
}

export class UpdateNamespaceArgs {
  readonly securityCouncil: PublicKey
  readonly reviewCouncil: PublicKey
  readonly lockupDefaultTargetRewardsPct: number
  readonly lockupDefaultTargetVotingPct: number
  readonly lockupMinDuration: BN
  readonly lockupMinAmount: BN
  readonly lockupMaxSaturation: BN
  readonly proposalMinVotingPowerForQuorum: BN
  readonly proposalMinPassPct: number
  readonly proposalCanUpdateAfterVotes: boolean

  constructor(fields: UpdateNamespaceArgsFields) {
    this.securityCouncil = fields.securityCouncil
    this.reviewCouncil = fields.reviewCouncil
    this.lockupDefaultTargetRewardsPct = fields.lockupDefaultTargetRewardsPct
    this.lockupDefaultTargetVotingPct = fields.lockupDefaultTargetVotingPct
    this.lockupMinDuration = fields.lockupMinDuration
    this.lockupMinAmount = fields.lockupMinAmount
    this.lockupMaxSaturation = fields.lockupMaxSaturation
    this.proposalMinVotingPowerForQuorum =
      fields.proposalMinVotingPowerForQuorum
    this.proposalMinPassPct = fields.proposalMinPassPct
    this.proposalCanUpdateAfterVotes = fields.proposalCanUpdateAfterVotes
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.publicKey("securityCouncil"),
        borsh.publicKey("reviewCouncil"),
        borsh.u16("lockupDefaultTargetRewardsPct"),
        borsh.u16("lockupDefaultTargetVotingPct"),
        borsh.i64("lockupMinDuration"),
        borsh.u64("lockupMinAmount"),
        borsh.u64("lockupMaxSaturation"),
        borsh.u64("proposalMinVotingPowerForQuorum"),
        borsh.u16("proposalMinPassPct"),
        borsh.bool("proposalCanUpdateAfterVotes"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new UpdateNamespaceArgs({
      securityCouncil: obj.securityCouncil,
      reviewCouncil: obj.reviewCouncil,
      lockupDefaultTargetRewardsPct: obj.lockupDefaultTargetRewardsPct,
      lockupDefaultTargetVotingPct: obj.lockupDefaultTargetVotingPct,
      lockupMinDuration: obj.lockupMinDuration,
      lockupMinAmount: obj.lockupMinAmount,
      lockupMaxSaturation: obj.lockupMaxSaturation,
      proposalMinVotingPowerForQuorum: obj.proposalMinVotingPowerForQuorum,
      proposalMinPassPct: obj.proposalMinPassPct,
      proposalCanUpdateAfterVotes: obj.proposalCanUpdateAfterVotes,
    })
  }

  static toEncodable(fields: UpdateNamespaceArgsFields) {
    return {
      securityCouncil: fields.securityCouncil,
      reviewCouncil: fields.reviewCouncil,
      lockupDefaultTargetRewardsPct: fields.lockupDefaultTargetRewardsPct,
      lockupDefaultTargetVotingPct: fields.lockupDefaultTargetVotingPct,
      lockupMinDuration: fields.lockupMinDuration,
      lockupMinAmount: fields.lockupMinAmount,
      lockupMaxSaturation: fields.lockupMaxSaturation,
      proposalMinVotingPowerForQuorum: fields.proposalMinVotingPowerForQuorum,
      proposalMinPassPct: fields.proposalMinPassPct,
      proposalCanUpdateAfterVotes: fields.proposalCanUpdateAfterVotes,
    }
  }

  toJSON(): UpdateNamespaceArgsJSON {
    return {
      securityCouncil: this.securityCouncil.toString(),
      reviewCouncil: this.reviewCouncil.toString(),
      lockupDefaultTargetRewardsPct: this.lockupDefaultTargetRewardsPct,
      lockupDefaultTargetVotingPct: this.lockupDefaultTargetVotingPct,
      lockupMinDuration: this.lockupMinDuration.toString(),
      lockupMinAmount: this.lockupMinAmount.toString(),
      lockupMaxSaturation: this.lockupMaxSaturation.toString(),
      proposalMinVotingPowerForQuorum:
        this.proposalMinVotingPowerForQuorum.toString(),
      proposalMinPassPct: this.proposalMinPassPct,
      proposalCanUpdateAfterVotes: this.proposalCanUpdateAfterVotes,
    }
  }

  static fromJSON(obj: UpdateNamespaceArgsJSON): UpdateNamespaceArgs {
    return new UpdateNamespaceArgs({
      securityCouncil: new PublicKey(obj.securityCouncil),
      reviewCouncil: new PublicKey(obj.reviewCouncil),
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
    })
  }

  toEncodable() {
    return UpdateNamespaceArgs.toEncodable(this)
  }
}
