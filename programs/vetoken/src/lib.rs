mod errors;
mod ins_v1;
mod states;

use crate::ins_v1::*;
use anchor_lang::prelude::*;

anchor_lang::declare_id!("veTbq5fF2HWYpgmkwjGKTYLVpY6miWYYmakML7R7LRf");

#[program]
pub mod vetoken {
    use super::*;

    pub fn init_global<'info>(ctx: Context<'_, '_, '_, 'info, InitGlobal<'info>>) -> Result<()> {
        ins_v1::init_global::handle(ctx)
    }

    pub fn update_global<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateGlobal<'info>>,
        args: UpdateGlobalArgs,
    ) -> Result<()> {
        ins_v1::update_global::handle(ctx, args)
    }

    pub fn stake<'info>(
        ctx: Context<'_, '_, '_, 'info, Stake<'info>>,
        args: StakeArgs,
    ) -> Result<()> {
        ins_v1::stake::handle(ctx, args)
    }

    pub fn unstake<'info>(ctx: Context<'_, '_, '_, 'info, Unstake<'info>>) -> Result<()> {
        ins_v1::unstake::handle(ctx)
    }

    pub fn init_proposal<'info>(
        ctx: Context<'_, '_, '_, 'info, InitProposal<'info>>,
        args: InitProposalArgs,
    ) -> Result<()> {
        ins_v1::init_proposal::handle(ctx, args)
    }

    pub fn update_proposal<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateProposal<'info>>,
        args: UpdateProposalArgs,
    ) -> Result<()> {
        ins_v1::update_proposal::handle(ctx, args)
    }

    pub fn vote<'info>(ctx: Context<'_, '_, '_, 'info, Vote<'info>>, args: VoteArgs) -> Result<()> {
        ins_v1::vote::handle(ctx, args)
    }
}

#[macro_export]
macro_rules! lockup_seeds {
    ( $owner:expr, $bump:expr ) => {
        &[b"lockup".as_ref(), $owner.key.as_ref(), &[$bump]]
    };
}
