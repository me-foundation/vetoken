use std::cmp::min;

use crate::{
    errors::CustomError,
    states::{Lockup, Namespace},
};
use anchor_lang::{prelude::*, AnchorDeserialize};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StakeToArgs {
    amount: u64,
    end_ts: i64,
    disable_rewards: bool, // optionally disable target_rewards_pct for the owner
}

// StakeTo means that security_council is staking tokens to the lockup account for the owner.
#[derive(Accounts)]
#[instruction(args:StakeToArgs)]
pub struct StakeTo<'info> {
    #[account(mut)]
    security_council: Signer<'info>,

    /// CHECK: owner is an input parameter, it will be the owner of the lockup account
    #[account()]
    owner: UncheckedAccount<'info>,

    #[account()]
    token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::token_program = token_program,
        associated_token::mint = token_mint,
        associated_token::authority = security_council, // should be owned by the security_council to start stake_to
        constraint = token_account.amount >= args.amount @ CustomError::InvalidTokenAmount,
    )]
    token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
      init, // we should assume that the person has not staked before
      payer=security_council,
      seeds=[b"lockup", ns.key().as_ref(), owner.key().as_ref()],
      space= 8 + Lockup::INIT_SPACE,
      constraint = args.amount >= ns.lockup_min_amount @ CustomError::InvalidLockupAmount,
      constraint = (args.end_ts >= lockup.min_end_ts(&ns) || args.end_ts == 0) @ CustomError::InvalidTimestamp,
      bump
    )]
    lockup: Box<Account<'info, Lockup>>,

    #[account(
        init_if_needed,
        token::token_program = token_program,
        associated_token::token_program = token_program,
        associated_token::mint = token_mint,
        associated_token::authority = lockup,
        payer = security_council,
    )]
    lockup_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        has_one = token_mint,
        has_one = security_council,
    )]
    ns: Box<Account<'info, Namespace>>,

    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
    associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, StakeTo<'info>>,
    args: StakeToArgs,
) -> Result<()> {
    let lockup = &mut ctx.accounts.lockup;
    let ns = &mut ctx.accounts.ns;

    anchor_spl::token_interface::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_interface::TransferChecked {
                from: ctx.accounts.token_account.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.lockup_token_account.to_account_info(),
                authority: ctx.accounts.security_council.to_account_info(),
            },
        ),
        args.amount,
        ctx.accounts.token_mint.decimals,
    )?;

    lockup.ns = ns.key();
    lockup.start_ts = ns.now();
    lockup.end_ts = min(
        args.end_ts,
        lockup.start_ts + (ns.lockup_max_saturation as i64),
    );
    lockup.weighted_start_ts = lockup.start_ts;
    lockup.amount = args.amount;
    lockup.owner = ctx.accounts.owner.key();
    lockup.target_voting_pct = ns.lockup_default_target_voting_pct;
    lockup.target_rewards_pct = match args.disable_rewards {
        true => 0,
        false => ns.lockup_default_target_rewards_pct,
    };

    ns.lockup_amount = ns
        .lockup_amount
        .checked_add(args.amount)
        .expect("should not overflow");

    if !lockup.valid(ns) {
        return Err(CustomError::InvalidLockup.into());
    }

    Ok(())
}
