import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface UpdateNamespaceArgsFields {
  securityCouncil: PublicKey | null
  reviewCouncil: PublicKey | null
  debugTsOffset: BN | null
  lockupDefaultTargetRewardsBp: number | null
  lockupDefaultTargetVotingBp: number | null
  lockupMinDuration: BN | null
  lockupMinAmount: BN | null
  lockupMaxSaturation: BN | null
  proposalMinVotingPowerForQuorum: BN | null
  proposalMinPassBp: number | null
}

export interface UpdateNamespaceArgsJSON {
  securityCouncil: string | null
  reviewCouncil: string | null
  debugTsOffset: string | null
  lockupDefaultTargetRewardsBp: number | null
  lockupDefaultTargetVotingBp: number | null
  lockupMinDuration: string | null
  lockupMinAmount: string | null
  lockupMaxSaturation: string | null
  proposalMinVotingPowerForQuorum: string | null
  proposalMinPassBp: number | null
}

export class UpdateNamespaceArgs {
  readonly securityCouncil: PublicKey | null
  readonly reviewCouncil: PublicKey | null
  readonly debugTsOffset: BN | null
  readonly lockupDefaultTargetRewardsBp: number | null
  readonly lockupDefaultTargetVotingBp: number | null
  readonly lockupMinDuration: BN | null
  readonly lockupMinAmount: BN | null
  readonly lockupMaxSaturation: BN | null
  readonly proposalMinVotingPowerForQuorum: BN | null
  readonly proposalMinPassBp: number | null

  constructor(fields: UpdateNamespaceArgsFields) {
    this.securityCouncil = fields.securityCouncil
    this.reviewCouncil = fields.reviewCouncil
    this.debugTsOffset = fields.debugTsOffset
    this.lockupDefaultTargetRewardsBp = fields.lockupDefaultTargetRewardsBp
    this.lockupDefaultTargetVotingBp = fields.lockupDefaultTargetVotingBp
    this.lockupMinDuration = fields.lockupMinDuration
    this.lockupMinAmount = fields.lockupMinAmount
    this.lockupMaxSaturation = fields.lockupMaxSaturation
    this.proposalMinVotingPowerForQuorum =
      fields.proposalMinVotingPowerForQuorum
    this.proposalMinPassBp = fields.proposalMinPassBp
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.option(borsh.publicKey(), "securityCouncil"),
        borsh.option(borsh.publicKey(), "reviewCouncil"),
        borsh.option(borsh.i64(), "debugTsOffset"),
        borsh.option(borsh.u16(), "lockupDefaultTargetRewardsBp"),
        borsh.option(borsh.u16(), "lockupDefaultTargetVotingBp"),
        borsh.option(borsh.i64(), "lockupMinDuration"),
        borsh.option(borsh.u64(), "lockupMinAmount"),
        borsh.option(borsh.u64(), "lockupMaxSaturation"),
        borsh.option(borsh.u64(), "proposalMinVotingPowerForQuorum"),
        borsh.option(borsh.u16(), "proposalMinPassBp"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new UpdateNamespaceArgs({
      securityCouncil: obj.securityCouncil,
      reviewCouncil: obj.reviewCouncil,
      debugTsOffset: obj.debugTsOffset,
      lockupDefaultTargetRewardsBp: obj.lockupDefaultTargetRewardsBp,
      lockupDefaultTargetVotingBp: obj.lockupDefaultTargetVotingBp,
      lockupMinDuration: obj.lockupMinDuration,
      lockupMinAmount: obj.lockupMinAmount,
      lockupMaxSaturation: obj.lockupMaxSaturation,
      proposalMinVotingPowerForQuorum: obj.proposalMinVotingPowerForQuorum,
      proposalMinPassBp: obj.proposalMinPassBp,
    })
  }

  static toEncodable(fields: UpdateNamespaceArgsFields) {
    return {
      securityCouncil: fields.securityCouncil,
      reviewCouncil: fields.reviewCouncil,
      debugTsOffset: fields.debugTsOffset,
      lockupDefaultTargetRewardsBp: fields.lockupDefaultTargetRewardsBp,
      lockupDefaultTargetVotingBp: fields.lockupDefaultTargetVotingBp,
      lockupMinDuration: fields.lockupMinDuration,
      lockupMinAmount: fields.lockupMinAmount,
      lockupMaxSaturation: fields.lockupMaxSaturation,
      proposalMinVotingPowerForQuorum: fields.proposalMinVotingPowerForQuorum,
      proposalMinPassBp: fields.proposalMinPassBp,
    }
  }

  toJSON(): UpdateNamespaceArgsJSON {
    return {
      securityCouncil:
        (this.securityCouncil && this.securityCouncil.toString()) || null,
      reviewCouncil:
        (this.reviewCouncil && this.reviewCouncil.toString()) || null,
      debugTsOffset:
        (this.debugTsOffset && this.debugTsOffset.toString()) || null,
      lockupDefaultTargetRewardsBp: this.lockupDefaultTargetRewardsBp,
      lockupDefaultTargetVotingBp: this.lockupDefaultTargetVotingBp,
      lockupMinDuration:
        (this.lockupMinDuration && this.lockupMinDuration.toString()) || null,
      lockupMinAmount:
        (this.lockupMinAmount && this.lockupMinAmount.toString()) || null,
      lockupMaxSaturation:
        (this.lockupMaxSaturation && this.lockupMaxSaturation.toString()) ||
        null,
      proposalMinVotingPowerForQuorum:
        (this.proposalMinVotingPowerForQuorum &&
          this.proposalMinVotingPowerForQuorum.toString()) ||
        null,
      proposalMinPassBp: this.proposalMinPassBp,
    }
  }

  static fromJSON(obj: UpdateNamespaceArgsJSON): UpdateNamespaceArgs {
    return new UpdateNamespaceArgs({
      securityCouncil:
        (obj.securityCouncil && new PublicKey(obj.securityCouncil)) || null,
      reviewCouncil:
        (obj.reviewCouncil && new PublicKey(obj.reviewCouncil)) || null,
      debugTsOffset: (obj.debugTsOffset && new BN(obj.debugTsOffset)) || null,
      lockupDefaultTargetRewardsBp: obj.lockupDefaultTargetRewardsBp,
      lockupDefaultTargetVotingBp: obj.lockupDefaultTargetVotingBp,
      lockupMinDuration:
        (obj.lockupMinDuration && new BN(obj.lockupMinDuration)) || null,
      lockupMinAmount:
        (obj.lockupMinAmount && new BN(obj.lockupMinAmount)) || null,
      lockupMaxSaturation:
        (obj.lockupMaxSaturation && new BN(obj.lockupMaxSaturation)) || null,
      proposalMinVotingPowerForQuorum:
        (obj.proposalMinVotingPowerForQuorum &&
          new BN(obj.proposalMinVotingPowerForQuorum)) ||
        null,
      proposalMinPassBp: obj.proposalMinPassBp,
    })
  }

  toEncodable() {
    return UpdateNamespaceArgs.toEncodable(this)
  }
}
