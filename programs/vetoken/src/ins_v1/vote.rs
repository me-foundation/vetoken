use crate::{
    errors::CustomError,
    states::{Global, Lockup, Proposal, VoteRecord},
};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct VoteArgs {
    choice: u8,
}

#[derive(Accounts)]
#[instruction(args:VoteArgs)]
pub struct Vote<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(
      mut,
      constraint = global.now() >= proposal.start_ts && global.now() <= proposal.end_ts @ CustomError::InvalidTimestamp,
    )]
    proposal: Box<Account<'info, Proposal>>,

    #[account(
      seeds = [b"lockup", owner.key().as_ref()],
      has_one = owner,
      constraint = lockup.voting_power(&global) > 0 @ CustomError::InvalidVotingPower,
      bump,
    )]
    lockup: Box<Account<'info, Lockup>>,

    #[account(
      init,
      seeds = [b"vote_record", owner.key().as_ref(), proposal.key().as_ref()],
      payer = owner,
      space = 8 + VoteRecord::INIT_SPACE,
      bump,
    )]
    vote_record: Box<Account<'info, VoteRecord>>,

    #[account(
      seeds = [b"global"],
      bump,
    )]
    global: Box<Account<'info, Global>>,

    system_program: Program<'info, System>,
}

pub fn handle<'info>(ctx: Context<'_, '_, '_, 'info, Vote<'info>>, args: VoteArgs) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let lockup = &ctx.accounts.lockup;
    let global = &ctx.accounts.global;
    let vote_record = &mut ctx.accounts.vote_record;
    let voting_power = lockup.voting_power(global);

    proposal.cast_vote(args.choice, voting_power);
    proposal.set_status(None);

    vote_record.choice = args.choice;
    vote_record.owner = ctx.accounts.owner.key();
    vote_record.proposal = ctx.accounts.proposal.key();
    vote_record.voting_power = voting_power;
    vote_record.lockup = ctx.accounts.lockup.key();

    Ok(())
}
