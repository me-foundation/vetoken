use crate::states::Namespace;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

#[derive(Accounts)]
pub struct InitNamespace<'info> {
    #[account(mut)]
    deployer: Signer<'info>,

    /// CHECK: This is the security council account as an input
    #[account()]
    security_council: UncheckedAccount<'info>,

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
    ns.token_mint = ctx.accounts.token_mint.key();
    ns.deployer = ctx.accounts.deployer.key();

    ns.lockup_default_target_rewards_bp = 10000;
    ns.lockup_default_target_voting_bp = 10000; // 100%
    ns.lockup_min_duration = 86400 * 14; // 14 day in seconds
    ns.lockup_min_amount = 10 * 1_000_000; // ui amount is 10 assuming 6 decimals
    ns.lockup_max_saturation = 86400 * 365 * 4; // 4 years in seconds
    ns.proposal_min_voting_power_for_creation = 50 * 1_000_000; // ui amount is 50 assuming 6 decimals
    ns.proposal_min_voting_power_for_quorum = 10 * 1_000_000; // minimum participation voting power
    ns.proposal_min_pass_bp = 6000; // 60%, the population is total_votes
    Ok(())
}
