use crate::{
    errors::CustomError,
    states::{Global, Lockup, Proposal},
};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitProposalArgs {
    uri: [u8; 256],
    start_ts: i64,
    end_ts: i64,
}

#[derive(Accounts)]
#[instruction(args:InitProposalArgs)]
pub struct InitProposal<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(
      init,
      seeds = [b"proposal", global.proposal_nonce.to_le_bytes().as_ref()],
      payer = owner,
      space = 8+Proposal::INIT_SPACE,
      constraint = lockup.voting_power(&global) >= Proposal::MIN_PROPOSAL_VOTING_POWER @ CustomError::InvalidVotingPower,
      constraint = args.end_ts >= args.start_ts @ CustomError::InvalidTimestamp,
      bump,
    )]
    proposal: Box<Account<'info, Proposal>>,

    #[account(
      seeds = [b"lockup", owner.key().as_ref()],
      has_one = owner,
      bump,
    )]
    lockup: Box<Account<'info, Lockup>>,

    #[account(
      mut,
      seeds = [b"global"],
      bump,
    )]
    global: Box<Account<'info, Global>>,

    system_program: Program<'info, System>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, InitProposal<'info>>,
    args: InitProposalArgs,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let global = &mut ctx.accounts.global;

    proposal.uri = args.uri;
    proposal.start_ts = args.start_ts;
    proposal.end_ts = args.end_ts;
    proposal.status = Proposal::STATUS_CREATED;
    proposal.owner = ctx.accounts.owner.key();
    proposal.nonce = global.proposal_nonce;

    global.proposal_nonce += 1;
    Ok(())
}
