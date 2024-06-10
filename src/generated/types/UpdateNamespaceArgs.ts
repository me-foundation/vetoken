import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface UpdateNamespaceArgsFields {
  securityCouncil: PublicKey
  reviewCouncil: PublicKey
  lockupDefaultTargetRewardsBp: number
  lockupDefaultTargetVotingBp: number
  lockupMinDuration: BN
  lockupMinAmount: BN
  lockupMaxSaturation: BN
  proposalMinVotingPowerForQuorum: BN
  proposalMinPassBp: number
  proposalCanUpdateAfterVotes: boolean
}

export interface UpdateNamespaceArgsJSON {
  securityCouncil: string
  reviewCouncil: string
  lockupDefaultTargetRewardsBp: number
  lockupDefaultTargetVotingBp: number
  lockupMinDuration: string
  lockupMinAmount: string
  lockupMaxSaturation: string
  proposalMinVotingPowerForQuorum: string
  proposalMinPassBp: number
  proposalCanUpdateAfterVotes: boolean
}

export class UpdateNamespaceArgs {
  readonly securityCouncil: PublicKey
  readonly reviewCouncil: PublicKey
  readonly lockupDefaultTargetRewardsBp: number
  readonly lockupDefaultTargetVotingBp: number
  readonly lockupMinDuration: BN
  readonly lockupMinAmount: BN
  readonly lockupMaxSaturation: BN
  readonly proposalMinVotingPowerForQuorum: BN
  readonly proposalMinPassBp: number
  readonly proposalCanUpdateAfterVotes: boolean

  constructor(fields: UpdateNamespaceArgsFields) {
    this.securityCouncil = fields.securityCouncil
    this.reviewCouncil = fields.reviewCouncil
    this.lockupDefaultTargetRewardsBp = fields.lockupDefaultTargetRewardsBp
    this.lockupDefaultTargetVotingBp = fields.lockupDefaultTargetVotingBp
    this.lockupMinDuration = fields.lockupMinDuration
    this.lockupMinAmount = fields.lockupMinAmount
    this.lockupMaxSaturation = fields.lockupMaxSaturation
    this.proposalMinVotingPowerForQuorum =
      fields.proposalMinVotingPowerForQuorum
    this.proposalMinPassBp = fields.proposalMinPassBp
    this.proposalCanUpdateAfterVotes = fields.proposalCanUpdateAfterVotes
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.publicKey("securityCouncil"),
        borsh.publicKey("reviewCouncil"),
        borsh.u16("lockupDefaultTargetRewardsBp"),
        borsh.u16("lockupDefaultTargetVotingBp"),
        borsh.i64("lockupMinDuration"),
        borsh.u64("lockupMinAmount"),
        borsh.u64("lockupMaxSaturation"),
        borsh.u64("proposalMinVotingPowerForQuorum"),
        borsh.u16("proposalMinPassBp"),
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
      lockupDefaultTargetRewardsBp: obj.lockupDefaultTargetRewardsBp,
      lockupDefaultTargetVotingBp: obj.lockupDefaultTargetVotingBp,
      lockupMinDuration: obj.lockupMinDuration,
      lockupMinAmount: obj.lockupMinAmount,
      lockupMaxSaturation: obj.lockupMaxSaturation,
      proposalMinVotingPowerForQuorum: obj.proposalMinVotingPowerForQuorum,
      proposalMinPassBp: obj.proposalMinPassBp,
      proposalCanUpdateAfterVotes: obj.proposalCanUpdateAfterVotes,
    })
  }

  static toEncodable(fields: UpdateNamespaceArgsFields) {
    return {
      securityCouncil: fields.securityCouncil,
      reviewCouncil: fields.reviewCouncil,
      lockupDefaultTargetRewardsBp: fields.lockupDefaultTargetRewardsBp,
      lockupDefaultTargetVotingBp: fields.lockupDefaultTargetVotingBp,
      lockupMinDuration: fields.lockupMinDuration,
      lockupMinAmount: fields.lockupMinAmount,
      lockupMaxSaturation: fields.lockupMaxSaturation,
      proposalMinVotingPowerForQuorum: fields.proposalMinVotingPowerForQuorum,
      proposalMinPassBp: fields.proposalMinPassBp,
      proposalCanUpdateAfterVotes: fields.proposalCanUpdateAfterVotes,
    }
  }

  toJSON(): UpdateNamespaceArgsJSON {
    return {
      securityCouncil: this.securityCouncil.toString(),
      reviewCouncil: this.reviewCouncil.toString(),
      lockupDefaultTargetRewardsBp: this.lockupDefaultTargetRewardsBp,
      lockupDefaultTargetVotingBp: this.lockupDefaultTargetVotingBp,
      lockupMinDuration: this.lockupMinDuration.toString(),
      lockupMinAmount: this.lockupMinAmount.toString(),
      lockupMaxSaturation: this.lockupMaxSaturation.toString(),
      proposalMinVotingPowerForQuorum:
        this.proposalMinVotingPowerForQuorum.toString(),
      proposalMinPassBp: this.proposalMinPassBp,
      proposalCanUpdateAfterVotes: this.proposalCanUpdateAfterVotes,
    }
  }

  static fromJSON(obj: UpdateNamespaceArgsJSON): UpdateNamespaceArgs {
    return new UpdateNamespaceArgs({
      securityCouncil: new PublicKey(obj.securityCouncil),
      reviewCouncil: new PublicKey(obj.reviewCouncil),
      lockupDefaultTargetRewardsBp: obj.lockupDefaultTargetRewardsBp,
      lockupDefaultTargetVotingBp: obj.lockupDefaultTargetVotingBp,
      lockupMinDuration: new BN(obj.lockupMinDuration),
      lockupMinAmount: new BN(obj.lockupMinAmount),
      lockupMaxSaturation: new BN(obj.lockupMaxSaturation),
      proposalMinVotingPowerForQuorum: new BN(
        obj.proposalMinVotingPowerForQuorum
      ),
      proposalMinPassBp: obj.proposalMinPassBp,
      proposalCanUpdateAfterVotes: obj.proposalCanUpdateAfterVotes,
    })
  }

  toEncodable() {
    return UpdateNamespaceArgs.toEncodable(this)
  }
}
