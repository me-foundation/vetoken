use crate::{
    distribution_seeds,
    errors::CustomError,
    states::{Distribution, DistributionClaim, Namespace},
};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ClaimFromDistributionArgs {
    amount: u64,
    cosigned_msg: [u8; 32], // cosigned_msg is a sha256 hash of the message that was cosigned, it's per ns per claimant per message digest
}

#[derive(Accounts)]
#[instruction(args:ClaimFromDistributionArgs)]
pub struct ClaimFromDistribution<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    /// CHECK: claimant is an input parameter, it will be the owner of the claimant_token_account
    #[account()]
    claimant: UncheckedAccount<'info>,

    #[account()]
    cosigner_1: Signer<'info>,

    #[account()]
    cosigner_2: Signer<'info>,

    #[account(
      init,
      seeds=[b"claim", ns.key().as_ref(), args.cosigned_msg.as_ref()],
      payer=payer,
      space=8+DistributionClaim::INIT_SPACE,
      bump,
    )]
    distribution_claim: Box<Account<'info, DistributionClaim>>,

    #[account(
      seeds=[b"distribution", ns.key().as_ref(), cosigner_1.key().as_ref(), cosigner_2.key().as_ref(), distribution.uuid.as_ref()],
      has_one = distribution_token_mint,
      has_one = cosigner_1,
      has_one = cosigner_2,
      has_one = ns,
      constraint = distribution.start_ts <= ns.now() @ CustomError::InvalidTimestamp,
      bump,
    )]
    distribution: Box<Account<'info, Distribution>>,

    #[account()]
    distribution_token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: distribution_token_account should be owned by distribution pda, but does't have to the ata of the distribution_token_mint
    /// Use multiple token accounts to shard the writes
    #[account(
      mut,
      token::token_program = token_program,
      token::mint = distribution_token_mint,
      token::authority = distribution,
      constraint = distribution_token_account.amount >= args.amount @ CustomError::InvalidTokenAmount,
    )]
    distribution_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
      init_if_needed,
      token::token_program = token_program,
      associated_token::token_program = token_program,
      associated_token::mint = distribution_token_mint,
      associated_token::authority = claimant,
      payer = payer,
    )]
    claimant_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account()]
    ns: Box<Account<'info, Namespace>>,

    token_program: Interface<'info, TokenInterface>,
    system_program: Program<'info, System>,
    associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handle<'info>(
    ctx: Context<'_, '_, '_, 'info, ClaimFromDistribution<'info>>,
    args: ClaimFromDistributionArgs,
) -> Result<()> {
    let distribution_claim = &mut ctx.accounts.distribution_claim;
    let ns = &ctx.accounts.ns;
    let cosigner_1 = &ctx.accounts.cosigner_1;
    let cosigner_2 = &ctx.accounts.cosigner_2;
    let uuid = ctx.accounts.distribution.uuid;
    let bump = ctx.bumps.distribution;

    distribution_claim.ns = ctx.accounts.ns.key();
    distribution_claim.claimant = ctx.accounts.claimant.key();
    distribution_claim.distribution = ctx.accounts.distribution.key();
    distribution_claim.amount = args.amount;
    distribution_claim.distribution_token_mint = ctx.accounts.distribution_token_mint.key();
    distribution_claim.cosigned_msg = args.cosigned_msg;

    anchor_spl::token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token_interface::TransferChecked {
                from: ctx.accounts.distribution_token_account.to_account_info(),
                mint: ctx.accounts.distribution_token_mint.to_account_info(),
                to: ctx.accounts.claimant_token_account.to_account_info(),
                authority: ctx.accounts.distribution.to_account_info(),
            },
            &[distribution_seeds!(ns, cosigner_1, cosigner_2, uuid, bump)],
        ),
        args.amount,
        ctx.accounts.distribution_token_mint.decimals,
    )?;

    Ok(())
}
