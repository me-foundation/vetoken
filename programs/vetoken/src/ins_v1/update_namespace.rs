use crate::states::Namespace;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateNamespaceArgs {
    security_council: Pubkey,
    review_council: Pubkey,

    lockup_default_target_rewards_bp: u16,
    lockup_default_target_voting_bp: u16,
    lockup_min_duration: i64,
    lockup_min_amount: u64,
    lockup_max_saturation: u64,
    proposal_min_voting_power_for_quorum: u64,
    proposal_min_pass_bp: u16,
    proposal_can_update_after_votes: bool,
}

#[derive(Accounts)]
#[instruction(args:UpdateNamespaceArgs)]
pub struct UpdateNamespace<'info> {
    #[account()]
    security_council: Signer<'info>,

    #[account(
      mut,
      has_one = security_council,
    )]
    ns: Box<Account<'info, Namespace>>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, UpdateNamespace<'info>>,
    args: UpdateNamespaceArgs,
) -> Result<()> {
    let ns = &mut ctx.accounts.ns;

    ns.security_council = args.security_council;
    ns.review_council = args.review_council;
    ns.lockup_default_target_rewards_bp = args.lockup_default_target_rewards_bp;
    ns.lockup_default_target_voting_bp = args.lockup_default_target_voting_bp;
    ns.lockup_min_duration = args.lockup_min_duration;
    ns.lockup_min_amount = args.lockup_min_amount;
    ns.lockup_max_saturation = args.lockup_max_saturation;
    ns.proposal_min_voting_power_for_quorum = args.proposal_min_voting_power_for_quorum;
    ns.proposal_min_pass_bp = args.proposal_min_pass_bp;
    ns.proposal_can_update_after_votes = args.proposal_can_update_after_votes;

    Ok(())
}
