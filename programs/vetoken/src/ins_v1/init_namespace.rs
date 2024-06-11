use crate::{errors::CustomError, states::Namespace};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

#[derive(Accounts)]
pub struct InitNamespace<'info> {
    #[account(mut)]
    deployer: Signer<'info>,

    /// CHECK: This is an input for the security council account
    #[account()]
    security_council: UncheckedAccount<'info>,

    /// CHECK: This is an input for the review council account
    #[account()]
    review_council: UncheckedAccount<'info>,

    #[account()]
    token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
      init,
      payer=deployer,
      seeds=[b"namespace", token_mint.key().as_ref(), deployer.key().as_ref()],
      space=8 + Namespace::INIT_SPACE,
      bump,
    )]
    ns: Account<'info, Namespace>,

    system_program: Program<'info, System>,
}

pub fn handle<'info>(ctx: Context<'_, '_, '_, 'info, InitNamespace<'info>>) -> Result<()> {
    let ns = &mut ctx.accounts.ns;
    ns.security_council = ctx.accounts.security_council.key();
    ns.review_council = ctx.accounts.review_council.key();
    ns.token_mint = ctx.accounts.token_mint.key();
    ns.deployer = ctx.accounts.deployer.key();

    // Setting the default values and the security council can change
    ns.lockup_default_target_rewards_pct = 100; // 100% of the voting power
    ns.lockup_default_target_voting_pct = 2000; // 2000%, i.e. 20x
    ns.lockup_min_duration = 86400 * 14; // 14 day in seconds
    ns.lockup_min_amount = 10 * 1_000_000; // ui amount is 10 assuming 6 decimals
    ns.lockup_max_saturation = 86400 * 365 * 4; // 4 years in seconds
    ns.proposal_min_voting_power_for_quorum = 10 * 1_000_000; // minimum participation voting power
    ns.proposal_min_pass_pct = 60; // 60%, the population is total_votes
    ns.proposal_can_update_after_votes = false;

    if !ns.valid() {
        return Err(CustomError::InvalidNamespace.into());
    }

    Ok(())
}
