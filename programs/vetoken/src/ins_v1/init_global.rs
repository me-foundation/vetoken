use crate::states::Global;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitGlobal<'info> {
    #[account(mut, address = Global::DEPLOYER)]
    authority: Signer<'info>,

    /// CHECK: This is the security council account as an input
    #[account()]
    security_council: UncheckedAccount<'info>,

    #[account(
      init,
      payer=authority,
      seeds=[b"global"],
      space= 8 + Global::INIT_SPACE,
      bump,
    )]
    global: Box<Account<'info, Global>>,

    system_program: Program<'info, System>,
}

pub fn handle<'info>(ctx: Context<'_, '_, '_, 'info, InitGlobal<'info>>) -> Result<()> {
    ctx.accounts.global.security_council = ctx.accounts.security_council.key();
    Ok(())
}
