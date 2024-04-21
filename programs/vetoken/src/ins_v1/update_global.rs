use crate::states::Global;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateGlobalArgs {
    new_security_council: Pubkey,
    debug_ts_offset: Option<i64>,
}

#[derive(Accounts)]
#[instruction(args:UpdateGlobalArgs)]
pub struct UpdateGlobal<'info> {
    #[account()]
    security_council: Signer<'info>,

    #[account(
      seeds=[b"global"],
      has_one = security_council,
      bump,
    )]
    global: Box<Account<'info, Global>>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, UpdateGlobal<'info>>,
    args: UpdateGlobalArgs,
) -> Result<()> {
    ctx.accounts.global.security_council = args.new_security_council;
    if cfg!(feature = "anchor-test") {
        ctx.accounts.global.debug_ts_offset = args.debug_ts_offset.unwrap_or(0);
    }
    Ok(())
}
