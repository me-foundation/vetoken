use crate::{
    distribution_seeds,
    states::{Distribution, Namespace},
};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
pub struct WithdrawFromDistribution<'info> {
    #[account(mut)]
    security_council: Signer<'info>,

    #[account(
      seeds=[b"distribution", ns.key().as_ref(), distribution.cosigner_1.key().as_ref(), distribution.cosigner_2.key().as_ref(), distribution.uuid.as_ref()],
      has_one = distribution_token_mint,
      has_one = ns,
      bump,
    )]
    distribution: Box<Account<'info, Distribution>>,

    #[account()]
    distribution_token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
      mut,
      token::token_program = token_program,
      token::mint = distribution_token_mint,
      token::authority = distribution,
    )]
    distribution_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
      init_if_needed,
      token::token_program = token_program,
      associated_token::token_program = token_program,
      associated_token::mint = distribution_token_mint,
      associated_token::authority = security_council,
      payer = security_council,
    )]
    security_council_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
      has_one = security_council,
    )]
    ns: Box<Account<'info, Namespace>>,

    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
    associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, WithdrawFromDistribution<'info>>,
) -> Result<()> {
    let ns = &ctx.accounts.ns;
    let distribution = &ctx.accounts.distribution;
    let cosigner_1 = distribution.cosigner_1;
    let cosigner_2 = distribution.cosigner_2;
    let uuid = distribution.uuid;
    let bump = ctx.bumps.distribution;

    anchor_spl::token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_interface::TransferChecked {
                from: ctx.accounts.distribution_token_account.to_account_info(),
                mint: ctx.accounts.distribution_token_mint.to_account_info(),
                to: ctx
                    .accounts
                    .security_council_token_account
                    .to_account_info(),
                authority: ctx.accounts.distribution.to_account_info(),
            },
            &[distribution_seeds!(ns, cosigner_1, cosigner_2, uuid, bump)],
        ),
        ctx.accounts.distribution_token_account.amount,
        ctx.accounts.distribution_token_mint.decimals,
    )?;

    anchor_spl::token_interface::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        anchor_spl::token_interface::CloseAccount {
            account: ctx.accounts.distribution_token_account.to_account_info(),
            destination: ctx.accounts.security_council.to_account_info(),
            authority: distribution.to_account_info(),
        },
        &[distribution_seeds!(ns, cosigner_1, cosigner_2, uuid, bump)],
    ))?;

    Ok(())
}
