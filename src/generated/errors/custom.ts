export type CustomError =
  | InvalidOwner
  | InvalidTokenMint
  | InvalidTokenAmount
  | InvalidTokenDelegate
  | InvalidTimestamp
  | InvalidLockupAmount
  | InvalidVotingPower
  | InvalidPayer
  | InvalidProposalState
  | Overflow
  | CannotUpdateProposal

export class InvalidOwner extends Error {
  static readonly code = 6000
  readonly code = 6000
  readonly name = "InvalidOwner"
  readonly msg = "Invalid Owner"

  constructor(readonly logs?: string[]) {
    super("6000: Invalid Owner")
  }
}

export class InvalidTokenMint extends Error {
  static readonly code = 6001
  readonly code = 6001
  readonly name = "InvalidTokenMint"
  readonly msg = "Invalid Token Mint"

  constructor(readonly logs?: string[]) {
    super("6001: Invalid Token Mint")
  }
}

export class InvalidTokenAmount extends Error {
  static readonly code = 6002
  readonly code = 6002
  readonly name = "InvalidTokenAmount"
  readonly msg = "Invalid Token Amount"

  constructor(readonly logs?: string[]) {
    super("6002: Invalid Token Amount")
  }
}

export class InvalidTokenDelegate extends Error {
  static readonly code = 6003
  readonly code = 6003
  readonly name = "InvalidTokenDelegate"
  readonly msg = "Invalid Timestamp"

  constructor(readonly logs?: string[]) {
    super("6003: Invalid Timestamp")
  }
}

export class InvalidTimestamp extends Error {
  static readonly code = 6004
  readonly code = 6004
  readonly name = "InvalidTimestamp"
  readonly msg = "Invalid Token Delegate"

  constructor(readonly logs?: string[]) {
    super("6004: Invalid Token Delegate")
  }
}

export class InvalidLockupAmount extends Error {
  static readonly code = 6005
  readonly code = 6005
  readonly name = "InvalidLockupAmount"
  readonly msg = "Invalid Lockup Amount"

  constructor(readonly logs?: string[]) {
    super("6005: Invalid Lockup Amount")
  }
}

export class InvalidVotingPower extends Error {
  static readonly code = 6006
  readonly code = 6006
  readonly name = "InvalidVotingPower"
  readonly msg = "Invalid Voting Power"

  constructor(readonly logs?: string[]) {
    super("6006: Invalid Voting Power")
  }
}

export class InvalidPayer extends Error {
  static readonly code = 6007
  readonly code = 6007
  readonly name = "InvalidPayer"
  readonly msg = "Invalid Payer"

  constructor(readonly logs?: string[]) {
    super("6007: Invalid Payer")
  }
}

export class InvalidProposalState extends Error {
  static readonly code = 6008
  readonly code = 6008
  readonly name = "InvalidProposalState"
  readonly msg = "Invalid Proposal State"

  constructor(readonly logs?: string[]) {
    super("6008: Invalid Proposal State")
  }
}

export class Overflow extends Error {
  static readonly code = 6009
  readonly code = 6009
  readonly name = "Overflow"
  readonly msg = "Overflow"

  constructor(readonly logs?: string[]) {
    super("6009: Overflow")
  }
}

export class CannotUpdateProposal extends Error {
  static readonly code = 6010
  readonly code = 6010
  readonly name = "CannotUpdateProposal"
  readonly msg = "Cannot Update Proposal"

  constructor(readonly logs?: string[]) {
    super("6010: Cannot Update Proposal")
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new InvalidOwner(logs)
    case 6001:
      return new InvalidTokenMint(logs)
    case 6002:
      return new InvalidTokenAmount(logs)
    case 6003:
      return new InvalidTokenDelegate(logs)
    case 6004:
      return new InvalidTimestamp(logs)
    case 6005:
      return new InvalidLockupAmount(logs)
    case 6006:
      return new InvalidVotingPower(logs)
    case 6007:
      return new InvalidPayer(logs)
    case 6008:
      return new InvalidProposalState(logs)
    case 6009:
      return new Overflow(logs)
    case 6010:
      return new CannotUpdateProposal(logs)
  }

  return null
}
