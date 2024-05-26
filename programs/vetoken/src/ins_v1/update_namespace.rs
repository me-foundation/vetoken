use crate::{id, states::Namespace};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateNamespaceArgs {
    new_security_council: Pubkey,
    debug_ts_offset: Option<i64>,
}

#[derive(Accounts)]
#[instruction(args:UpdateNamespaceArgs)]
pub struct UpdateNamespace<'info> {
    #[account()]
    security_council: Signer<'info>,

    #[account(
      mut,
      owner = id(),
      has_one = security_council,
    )]
    ns: Account<'info, Namespace>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, UpdateNamespace<'info>>,
    args: UpdateNamespaceArgs,
) -> Result<()> {
    ctx.accounts.ns.security_council = args.new_security_council;
    if cfg!(feature = "anchor-test") {
        ctx.accounts.ns.debug_ts_offset = args.debug_ts_offset.unwrap_or(0);
    }
    Ok(())
}
