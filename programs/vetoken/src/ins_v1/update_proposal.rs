use crate::{
    errors::CustomError,
    states::{Namespace, Proposal},
};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateProposalArgs {
    uri: [u8; 256],
    start_ts: i64,
    end_ts: i64,
}

#[derive(Accounts)]
#[instruction(args:UpdateProposalArgs)]
pub struct UpdateProposal<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    #[account(
      mut,
      has_one=ns,
      constraint = payer.key() == ns.security_council || payer.key() == proposal.owner @ CustomError::InvalidPayer,
      constraint = payer.key() == ns.security_council || !proposal.has_votes() @ CustomError::InvalidProposalState,
    )]
    proposal: Box<Account<'info, Proposal>>,

    #[account()]
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
