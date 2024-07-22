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
      constraint = (args.amount >= ns.lockup_min_amount || args.amount == 0) @ CustomError::InvalidLockupAmount,
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
    let lockup = &mut ctx.accounts.lockup;
    let ns = &mut ctx.accounts.ns;

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
    }

    // Staker can only extend the lockup period, not reduce it.
    if args.end_ts > lockup.end_ts {
        lockup.start_ts = ns.now();
        lockup.end_ts = args.end_ts;
    }

    lockup.ns = ns.key();
    lockup.owner = ctx.accounts.owner.key();

    lockup.amount = lockup
        .amount
        .checked_add(args.amount)
        .expect("should not overflow");
    ns.lockup_amount = ns
        .lockup_amount
        .checked_add(args.amount)
        .expect("should not overflow");

    if !lockup.valid(ns) {
        return Err(CustomError::InvalidLockup.into());
    }

    Ok(())
}
