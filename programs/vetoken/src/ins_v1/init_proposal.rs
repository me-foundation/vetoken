use crate::{
    errors::CustomError,
    states::{Namespace, Proposal},
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
    review_council: Signer<'info>,

    #[account(
      init,
      seeds=[b"proposal", ns.key().as_ref(), ns.proposal_nonce.to_le_bytes().as_ref()],
      payer=review_council,
      space=8+Proposal::INIT_SPACE,
      constraint = args.end_ts >= args.start_ts @ CustomError::InvalidTimestamp,
      bump,
    )]
    proposal: Box<Account<'info, Proposal>>,

    #[account(
      mut,
      has_one=review_council,
    )]
    ns: Box<Account<'info, Namespace>>,

    system_program: Program<'info, System>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, InitProposal<'info>>,
    args: InitProposalArgs,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let ns = &mut ctx.accounts.ns;

    proposal.ns = ns.key();
    proposal.uri = args.uri;
    proposal.start_ts = args.start_ts;
    proposal.end_ts = args.end_ts;
    proposal.status = Proposal::STATUS_CREATED;
    proposal.owner = ctx.accounts.review_council.key();
    proposal.nonce = ns.proposal_nonce;

    ns.proposal_nonce = ns
        .proposal_nonce
        .checked_add(1)
        .expect("should not overflow");
    Ok(())
}
