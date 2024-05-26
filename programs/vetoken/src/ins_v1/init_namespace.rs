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
    ctx.accounts.ns.security_council = ctx.accounts.security_council.key();
    ctx.accounts.ns.token_mint = ctx.accounts.token_mint.key();
    ctx.accounts.ns.deployer = ctx.accounts.deployer.key();
    Ok(())
}
