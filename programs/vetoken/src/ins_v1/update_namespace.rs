use crate::{id, states::Namespace};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateNamespaceArgs {
    security_council: Option<Pubkey>,
    review_council: Option<Pubkey>,
    debug_ts_offset: Option<i64>,

    lockup_default_target_rewards_bp: Option<u16>,
    lockup_default_target_voting_bp: Option<u16>,
    lockup_min_duration: Option<i64>,
    lockup_min_amount: Option<u64>,
    lockup_max_saturation: Option<u64>,
    proposal_min_voting_power_for_quorum: Option<u64>,
    proposal_min_pass_bp: Option<u16>,
}

#[derive(Accounts)]
#[instruction(args:UpdateNamespaceArgs)]
pub struct UpdateNamespace<'info> {
    #[account()]
    security_council: Signer<'info>,

    #[account(
      mut,
      has_one = security_council,
      constraint = *ns.to_account_info().owner == id(),
    )]
    ns: Box<Account<'info, Namespace>>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, UpdateNamespace<'info>>,
    args: UpdateNamespaceArgs,
) -> Result<()> {
    let ns = &mut ctx.accounts.ns;

    if cfg!(feature = "anchor-test") {
        ns.debug_ts_offset = args.debug_ts_offset.unwrap_or(0);
    }

    if let Some(security_council) = args.security_council {
        ns.security_council = security_council;
    }

    if let Some(review_council) = args.review_council {
        ns.review_council = review_council;
    }

    if let Some(lockup_default_target_rewards_bp) = args.lockup_default_target_rewards_bp {
        ns.lockup_default_target_rewards_bp = lockup_default_target_rewards_bp;
    }
    if let Some(lockup_default_target_voting_bp) = args.lockup_default_target_voting_bp {
        ns.lockup_default_target_voting_bp = lockup_default_target_voting_bp;
    }
    if let Some(lockup_min_duration) = args.lockup_min_duration {
        ns.lockup_min_duration = lockup_min_duration;
    }
    if let Some(lockup_min_amount) = args.lockup_min_amount {
        ns.lockup_min_amount = lockup_min_amount;
    }
    if let Some(lockup_max_saturation) = args.lockup_max_saturation {
        ns.lockup_max_saturation = lockup_max_saturation;
    }
    if let Some(proposal_min_voting_power_for_quorum) = args.proposal_min_voting_power_for_quorum {
        ns.proposal_min_voting_power_for_quorum = proposal_min_voting_power_for_quorum;
    }
    if let Some(proposal_min_pass_bp) = args.proposal_min_pass_bp {
        ns.proposal_min_pass_bp = proposal_min_pass_bp;
    }

    Ok(())
}
