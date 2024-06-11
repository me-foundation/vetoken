use crate::{
    errors::CustomError,
    states::{Lockup, Namespace, Proposal, VoteRecord},
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
      has_one=ns,
      constraint = ns.now() >= proposal.start_ts && ns.now() <= proposal.end_ts @ CustomError::InvalidTimestamp,
    )]
    proposal: Box<Account<'info, Proposal>>,

    #[account(
      seeds=[b"lockup", ns.key().as_ref(), owner.key().as_ref()],
      has_one=owner,
      has_one=ns,
      constraint = lockup.voting_power(&ns) > 0 @ CustomError::InvalidVotingPower,
      constraint = lockup.end_ts > proposal.end_ts @ CustomError::InvalidTimestamp,
      bump,
    )]
    lockup: Box<Account<'info, Lockup>>,

    #[account(
      init,
      seeds=[b"vote_record", ns.key().as_ref(), owner.key().as_ref(), proposal.key().as_ref()],
      payer=owner,
      space=8 + VoteRecord::INIT_SPACE,
      bump,
    )]
    vote_record: Box<Account<'info, VoteRecord>>,

    #[account()]
    ns: Box<Account<'info, Namespace>>,

    system_program: Program<'info, System>,
}

pub fn handle<'info>(ctx: Context<'_, '_, '_, 'info, Vote<'info>>, args: VoteArgs) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let lockup = &ctx.accounts.lockup;
    let ns = &ctx.accounts.ns;
    let vote_record = &mut ctx.accounts.vote_record;
    let voting_power = lockup.voting_power(ns);

    proposal.cast_vote(args.choice, voting_power);
    proposal.set_status(ns, None);

    vote_record.ns = ns.key();
    vote_record.choice = args.choice;
    vote_record.owner = ctx.accounts.owner.key();
    vote_record.proposal = ctx.accounts.proposal.key();
    vote_record.voting_power = voting_power;
    vote_record.lockup = ctx.accounts.lockup.key();

    if !vote_record.valid() {
        return Err(CustomError::InvalidVoteRecord.into());
    }

    Ok(())
}
