mod errors;
mod ins_v1;
mod states;

use crate::ins_v1::*;
use anchor_lang::prelude::*;

anchor_lang::declare_id!("veTbq5fF2HWYpgmkwjGKTYLVpY6miWYYmakML7R7LRf");

#[program]
pub mod vetoken {
    use super::*;

    // Initialize a new namespace. The namespace is created by the deployer + token_mint as the seeds
    pub fn init_namespace<'info>(
        ctx: Context<'_, '_, '_, 'info, InitNamespace<'info>>,
    ) -> Result<()> {
        ins_v1::init_namespace::handle(ctx)
    }

    // Update the namespace's config, gated by the namespace's security council
    pub fn update_namespace<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateNamespace<'info>>,
        args: UpdateNamespaceArgs,
    ) -> Result<()> {
        ins_v1::update_namespace::handle(ctx, args)
    }

    // Stake will upsert a lockup account and lock the tokens for the
    // lockup duration to get the voting power and rewards multiplier
    // data set.
    pub fn stake<'info>(
        ctx: Context<'_, '_, '_, 'info, Stake<'info>>,
        args: StakeArgs,
    ) -> Result<()> {
        ins_v1::stake::handle(ctx, args)
    }

    // StakeTo will allow security council to deposit and lock the tokens
    // for a user. It's identical to Stake but security council can also
    // disable the rewards for that user.
    //
    // Note that, if the user already has a lockup account, this will failed
    // because of the anchor 'init' macro check.
    pub fn stake_to<'info>(
        ctx: Context<'_, '_, '_, 'info, StakeTo<'info>>,
        args: StakeToArgs,
    ) -> Result<()> {
        ins_v1::stake_to::handle(ctx, args)
    }

    // Unstake will remove the lockup account and return the tokens back
    // to the owner.
    // Users can only unstake if the lockup period has ended.
    pub fn unstake<'info>(ctx: Context<'_, '_, '_, 'info, Unstake<'info>>) -> Result<()> {
        ins_v1::unstake::handle(ctx)
    }

    // Review council can create a proposal.
    pub fn init_proposal<'info>(
        ctx: Context<'_, '_, '_, 'info, InitProposal<'info>>,
        args: InitProposalArgs,
    ) -> Result<()> {
        ins_v1::init_proposal::handle(ctx, args)
    }

    // Review council can update a proposal.
    pub fn update_proposal<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateProposal<'info>>,
        args: UpdateProposalArgs,
    ) -> Result<()> {
        ins_v1::update_proposal::handle(ctx, args)
    }

    // Users with voting power greater than a threshold can vote on a proposal.
    pub fn vote<'info>(ctx: Context<'_, '_, '_, 'info, Vote<'info>>, args: VoteArgs) -> Result<()> {
        ins_v1::vote::handle(ctx, args)
    }

    // Init a 2FA cosigner-based distribution
    pub fn init_distribution<'info>(
        ctx: Context<'_, '_, '_, 'info, InitDistribution<'info>>,
        args: InitDistributionArgs,
    ) -> Result<()> {
        ins_v1::init_distribution::handle(ctx, args)
    }

    // Claim from distribution using a sharded delegate_token_account
    // The cosigned_msg should be independently signed by both 2FA cosigners
    pub fn claim_from_distribution<'info>(
        ctx: Context<'_, '_, '_, 'info, ClaimFromDistribution<'info>>,
        args: ClaimFromDistributionArgs,
    ) -> Result<()> {
        ins_v1::claim_from_distribution::handle(ctx, args)
    }
}

#[macro_export]
macro_rules! lockup_seeds {
    ( $ns:expr, $owner:expr, $bump:expr ) => {
        &[
            b"lockup".as_ref(),
            $ns.key().as_ref(),
            $owner.key.as_ref(),
            &[$bump],
        ]
    };
}

#[macro_export]
macro_rules! distribution_seeds {
    ( $ns:expr, $uuid:expr, $bump:expr ) => {
        &[
            b"distribution".as_ref(),
            $ns.key().as_ref(),
            $uuid.as_ref(),
            &[$bump],
        ]
    };
}
