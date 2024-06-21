use anchor_lang::prelude::*;

use crate::states::{Distribution, Namespace};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateDistributionArgs {
    start_ts: i64,
}

#[derive(Accounts)]
#[instruction(args:UpdateDistributionArgs)]
pub struct UpdateDistribution<'info> {
    #[account(mut)]
    security_council: Signer<'info>,

    #[account(
      mut,
      has_one = ns,
    )]
    distribution: Account<'info, Distribution>,

    #[account(
      has_one = security_council
    )]
    ns: Box<Account<'info, Namespace>>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, UpdateDistribution<'info>>,
    args: UpdateDistributionArgs,
) -> Result<()> {
    ctx.accounts.distribution.start_ts = args.start_ts;
    Ok(())
}
