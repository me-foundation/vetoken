use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Invalid Owner")]
    InvalidOwner,
    #[msg("Invalid Token Mint")]
    InvalidTokenMint,
    #[msg("Invalid Token Amount")]
    InvalidTokenAmount,
    #[msg("Invalid Timestamp")]
    InvalidTimestamp,
    #[msg("Invalid Lockup Amount")]
    InvalidLockupAmount,
    #[msg("Invalid Voting Power")]
    InvalidVotingPower,
    #[msg("Invalid Payer")]
    InvalidPayer,
    #[msg("Invalid Proposal State")]
    InvalidProposalState,
    #[msg("Overflow")]
    Overflow,
}
