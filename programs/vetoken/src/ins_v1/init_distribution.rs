use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

use crate::states::{Distribution, Namespace};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitDistributionArgs {
    cosigner_1: Pubkey,
    cosigner_2: Pubkey,
    start_ts: i64,
}

#[derive(Accounts)]
#[instruction(args:InitDistributionArgs)]
pub struct InitDistribution<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    #[account()]
    uuid: Signer<'info>,

    #[account(
      init,
      seeds=[b"distribution", ns.key().as_ref(), args.cosigner_1.as_ref(), args.cosigner_2.as_ref(), uuid.key().as_ref()],
      payer=payer,
      space=8+Distribution::INIT_SPACE,
      bump,
    )]
    distribution: Account<'info, Distribution>,

    /// CHECK: This is an input for the distribution token mint
    #[account()]
    distribution_token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account()]
    ns: Box<Account<'info, Namespace>>,

    system_program: Program<'info, System>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, InitDistribution<'info>>,
    args: InitDistributionArgs,
) -> Result<()> {
    let distribution = &mut ctx.accounts.distribution;
    distribution.ns = ctx.accounts.ns.key();
    distribution.cosigner_1 = args.cosigner_1;
    distribution.cosigner_2 = args.cosigner_2;
    distribution.uuid = ctx.accounts.uuid.key();
    distribution.start_ts = args.start_ts;
    distribution.distribution_token_mint = ctx.accounts.distribution_token_mint.key();

    Ok(())
}
