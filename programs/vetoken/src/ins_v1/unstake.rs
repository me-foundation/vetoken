use crate::{
    errors::CustomError,
    lockup_seeds,
    states::{Lockup, Namespace},
};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account()]
    token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::token_program = token_program,
        associated_token::mint = token_mint,
        associated_token::authority = owner,
    )]
    token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
      mut,
      seeds=[b"lockup", ns.key().as_ref(), owner.key().as_ref()],
      has_one=ns,
      has_one=owner,
      constraint = lockup.end_ts <= ns.now() @ CustomError::InvalidTimestamp,
      constraint = ns.lockup_amount >= lockup.amount @ CustomError::Overflow,
      bump,
      close=owner,
    )]
    lockup: Box<Account<'info, Lockup>>,

    #[account(
        mut,
        associated_token::token_program = token_program,
        associated_token::mint = token_mint,
        associated_token::authority = lockup,
        constraint = lockup_token_account.amount >= lockup.amount @ CustomError::InvalidLockupAmount,
    )]
    lockup_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        has_one = token_mint,
    )]
    ns: Box<Account<'info, Namespace>>,

    token_program: Interface<'info, TokenInterface>,
}

pub fn handle<'info>(ctx: Context<'_, '_, '_, 'info, Unstake<'info>>) -> Result<()> {
    let lockup = &mut ctx.accounts.lockup;
    let ns = &mut ctx.accounts.ns;
    let amount = lockup.amount;
    let owner = &ctx.accounts.owner;
    let bump = ctx.bumps.lockup;

    anchor_spl::token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_interface::TransferChecked {
                from: ctx.accounts.lockup_token_account.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: lockup.to_account_info(),
            },
            &[lockup_seeds!(ns, owner, bump)],
        ),
        amount,
        ctx.accounts.token_mint.decimals,
    )?;

    if ctx.accounts.lockup_token_account.amount == amount {
        anchor_spl::token_interface::close_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_interface::CloseAccount {
                account: ctx.accounts.lockup_token_account.to_account_info(),
                destination: owner.to_account_info(),
                authority: lockup.to_account_info(),
            },
            &[lockup_seeds!(ns, owner, bump)],
        ))?;
    }

    lockup.amount = 0;

    ns.lockup_amount = ns
        .lockup_amount
        .checked_sub(amount)
        .expect("underflow in reducing ns.lockup_amount");

    Ok(())
}
