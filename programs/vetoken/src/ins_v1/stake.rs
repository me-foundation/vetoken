use crate::{
    errors::CustomError,
    states::{Global, Lockup},
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

    #[account(address = Global::TOKEN_MINT)]
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
      init_if_needed,
      payer=owner,
      seeds=[b"lockup", owner.key().as_ref()],
      space= 8 + Lockup::INIT_SPACE,
      constraint = args.amount > Lockup::MIN_LOCKUP_AMOUNT @ CustomError::InvalidLockupAmount,
      constraint = args.end_ts >= lockup.min_end_ts(&global) @ CustomError::InvalidTimestamp,
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

    #[account(mut, seeds=[b"global"], bump)]
    global: Account<'info, Global>,

    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
    associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handle<'info>(ctx: Context<'_, '_, '_, 'info, Stake<'info>>, args: StakeArgs) -> Result<()> {
    let lockup = &mut ctx.accounts.lockup;
    let global = &mut ctx.accounts.global;

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
    )?;

    // Staker can only extend the lockup period, not reduce it.
    if args.end_ts > lockup.end_ts {
        lockup.start_ts = global.now();
        lockup.end_ts = args.end_ts;
    }

    global.lockup_amount += args.amount;

    lockup.amount += args.amount;
    lockup.owner = ctx.accounts.owner.key();

    if lockup.target_rewards_bp == 0 {
        lockup.target_rewards_bp = Lockup::DEFAULT_TARGET_REWARDS_BP;
    }
    if lockup.target_voting_bp == 0 {
        lockup.target_voting_bp = Lockup::DEFAULT_TARGET_VOTING_BP;
    }

    Ok(())
}
