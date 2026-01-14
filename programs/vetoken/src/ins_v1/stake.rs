use std::cmp::min;

use crate::{
    errors::CustomError,
    states::{Lockup, Namespace},
};
use anchor_lang::{prelude::*, AnchorDeserialize};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StakeArgs {
    amount: u64,
    end_ts: i64,
}

#[derive(Accounts)]
#[instruction(args:StakeArgs)]
pub struct Stake<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account()]
    token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::token_program = token_program,
        associated_token::mint = token_mint,
        associated_token::authority = owner,
        constraint = token_account.amount >= args.amount @ CustomError::InvalidTokenAmount,
    )]
    token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
      init_if_needed, // stake means upsert this lockup account, and users can extend the end_ts or deposit more tokens
      payer=owner,
      seeds=[b"lockup", ns.key().as_ref(), owner.key.as_ref()],
      space= 8 + Lockup::INIT_SPACE,
      constraint = (args.amount >= ns.lockup_min_amount || (args.amount == 0 && lockup.amount != 0)) @ CustomError::InvalidLockupAmount,
      constraint = (args.end_ts >= lockup.min_end_ts(&ns) || args.end_ts == 0) @ CustomError::InvalidTimestamp,
      constraint = (lockup.end_ts >= ns.now() || lockup.end_ts == 0) @ CustomError::InvalidTimestamp, // can only call stake to add more tokens or extend endTs when the lockup is still active
      bump
    )]
    lockup: Box<Account<'info, Lockup>>,

    #[account(
        init_if_needed,
        token::token_program = token_program,
        associated_token::token_program = token_program,
        associated_token::mint = token_mint,
        associated_token::authority = lockup,
        payer = owner,
    )]
    lockup_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        has_one = token_mint,
    )]
    ns: Box<Account<'info, Namespace>>,

    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
    associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handle<'info>(ctx: Context<'_, '_, '_, 'info, Stake<'info>>, args: StakeArgs) -> Result<()> {
    let ns = &mut ctx.accounts.ns;
    let now = ns.now();

    // Get the data length before creating the mutable borrow
    let data_len = ctx.accounts.lockup.to_account_info().data_len();
    let lockup = &mut ctx.accounts.lockup;

    lockup.normalize_weighted_start_ts(data_len);

    if args.amount > 0 {
        anchor_spl::token_interface::transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_interface::TransferChecked {
                    from: ctx.accounts.token_account.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.lockup_token_account.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            args.amount,
            ctx.accounts.token_mint.decimals,
        )?; // Transfer the staked tokens to the lockup account
    }

    // only the first time staking can set the default values for target rewards and voting power
    // this is to prevent the staker from overriding what's set by stake_to by security council, if any
    if lockup.amount == 0 {
        lockup.target_rewards_pct = ns.lockup_default_target_rewards_pct;
        lockup.target_voting_pct = ns.lockup_default_target_voting_pct;
        lockup.start_ts = now;
        lockup.weighted_start_ts = now;
        lockup.end_ts = min(
            args.end_ts,
            lockup.start_ts
                .checked_add(ns.lockup_max_saturation as i64)
                .expect("should not overflow"),
        );
        lockup.amount = args.amount;
    } else {
        // Additional stake: conserve time-weighted area and forbid shortening end_ts
        require!(args.end_ts > now, CustomError::InvalidTimestamp);
        
        let old_amount = lockup.amount as u128;
        let delta_amount = args.amount as u128;
        let new_amount = old_amount
            .checked_add(delta_amount)
            .expect("should not overflow");

        let capped_end = min(
            args.end_ts,
            lockup
                .start_ts
                .checked_add(ns.lockup_max_saturation as i64)
                .expect("should not overflow"),
        );

        // Special case: if old end_ts was 0 (unset), treat as first-time setting
        if lockup.end_ts == 0 {
            lockup.end_ts = capped_end;
            lockup.weighted_start_ts = now;
            lockup.amount = new_amount as u64;
        } else {
            // Normal case: old lockup has valid end_ts, use weighted area conservation
            require!(lockup.end_ts > lockup.start_ts, CustomError::InvalidTimestamp);
            require!(
                args.end_ts >= lockup.end_ts,
                CustomError::InvalidTimestamp
            );

            let effective_start = lockup.effective_start_ts() as i128;
            let old_duration = (lockup.end_ts as i128)
                .checked_sub(effective_start)
                .expect("duration should be positive");
            
            // Guard against negative or excessively large duration
            require!(old_duration >= 0, CustomError::InvalidTimestamp);
            require!(old_duration <= i64::MAX as i128, CustomError::InvalidTimestamp);
            
            let old_tw = old_amount
                .checked_mul(old_duration as u128)
                .expect("should not overflow");

            // If we extend end_ts, the existing amount gains extra area; account for it.
            let extension = (capped_end as i128)
                .checked_sub(lockup.end_ts as i128)
                .unwrap_or(0);
            let extension_tw = old_amount
                .checked_mul(extension.max(0) as u128)
                .expect("should not overflow");

            let remaining = (capped_end as i128)
                .checked_sub(now as i128)
                .expect("remaining should be non-negative");
            let added_tw = delta_amount
                .checked_mul(remaining as u128)
                .expect("should not overflow");

            let new_tw = old_tw
                .checked_add(extension_tw)
                .expect("should not overflow")
                .checked_add(added_tw)
                .expect("should not overflow");
            let new_weighted_start = (capped_end as i128)
                .checked_sub((new_tw / new_amount) as i128)
                .expect("should not underflow");

            lockup.amount = new_amount as u64;
            lockup.end_ts = capped_end;
            lockup.weighted_start_ts = new_weighted_start as i64;
        }
    }

    lockup.ns = ns.key();
    lockup.owner = ctx.accounts.owner.key();

    ns.lockup_amount = ns
        .lockup_amount
        .checked_add(args.amount)
        .expect("should not overflow");

    if !lockup.valid(ns) {
        return Err(CustomError::InvalidLockup.into());
    }

    Ok(())
}
