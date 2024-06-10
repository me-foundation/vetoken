use crate::{
    errors::CustomError,
    states::{Namespace, Proposal},
};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateProposalArgs {
    start_ts: i64,
    end_ts: i64,
    uri: String,
}

#[derive(Accounts)]
#[instruction(args:UpdateProposalArgs)]
pub struct UpdateProposal<'info> {
    #[account(mut)]
    review_council: Signer<'info>,

    #[account(
      mut,
      has_one=ns,
      constraint = proposal.can_update(&ns) @ CustomError::CannotUpdateProposal,
    )]
    proposal: Box<Account<'info, Proposal>>,

    #[account(
      has_one=review_council,
    )]
    ns: Box<Account<'info, Namespace>>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, UpdateProposal<'info>>,
    args: UpdateProposalArgs,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;

    proposal.uri = args.uri;
    proposal.start_ts = args.start_ts;
    proposal.end_ts = args.end_ts;
    Ok(())
}
