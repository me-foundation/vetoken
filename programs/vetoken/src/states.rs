use std::cmp::max;

use anchor_lang::{prelude::*, AnchorDeserialize};

#[account]
#[derive(Copy, InitSpace)]
pub struct Namespace {
    pub token_mint: Pubkey, // TODO: devnet example 8SMdDN9nZg2ntiBYieVKx7zeXL3DPPvFSTqV4KpsZAMH
    pub deployer: Pubkey,   // TODO: devnet example tstCcqtDJtqnNDjqqg3UdZfUyrUmzfZ1wo1vpmXbM2S
    pub security_council: Pubkey,

    pub lockup_amount: u64,
    pub proposal_nonce: u32,
    pub debug_ts_offset: i64,

    pub _padding: [u8; 240],
}

impl Namespace {
    pub fn now(&self) -> i64 {
        Clock::get()
            .expect("we should be able to get the clock timestamp")
            .unix_timestamp
            + self.debug_ts_offset
    }
}

#[account]
#[derive(Copy, InitSpace)]
pub struct Lockup {
    pub ns: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,

    pub start_ts: i64,
    pub end_ts: i64,

    pub target_rewards_bp: u16, // in bp
    pub target_voting_bp: u16,  // in bp

    pub _padding: [u8; 240],
}

impl Lockup {
    pub const DEFAULT_TARGET_REWARDS_BP: u16 = 10000;
    pub const DEFAULT_TARGET_VOTING_BP: u16 = 10000; // 100% more (as bonus) voting power if lockup saturation if met
    pub const MIN_LOCKUP_DURATION: i64 = 86400 * 30; // 30 day in seconds
    pub const MIN_LOCKUP_AMOUNT: u64 = 1000;
    pub const MAX_LOCKUP_SATURATION: u64 = 86400 * 365 * 4; // 4 years in seconds

    pub fn min_end_ts(&self, ns: &Namespace) -> i64 {
        ns.now() + Lockup::MIN_LOCKUP_DURATION
    }

    pub fn voting_power(&self, ns: &Namespace) -> u64 {
        let now = ns.now();

        if now >= self.end_ts {
            return self.amount;
        }

        let max_bonus = self
            .amount
            .checked_mul(Lockup::DEFAULT_TARGET_VOTING_BP as u64)
            .expect("should not overflow")
            .checked_div(10000)
            .expect("should not overflow");

        if now <= self.start_ts {
            return self
                .amount
                .checked_add(max_bonus)
                .expect("should not overflow");
        };

        let remainning_time = max(Lockup::MAX_LOCKUP_SATURATION, (self.end_ts - now) as u64);

        let bonus = max_bonus
            .checked_mul(remainning_time)
            .expect("should not overflow")
            .checked_div(Lockup::MAX_LOCKUP_SATURATION)
            .expect("should not overflow");

        self.amount.checked_add(bonus).expect("should not overflow")
    }

    #[allow(dead_code)]
    pub fn rewards_power(&self, ns: &Namespace) -> u64 {
        self.voting_power(ns)
    }
}

#[account]
#[derive(Copy, InitSpace)]
pub struct Proposal {
    pub ns: Pubkey,
    pub nonce: u32,
    pub owner: Pubkey,

    pub uri: [u8; 256],
    pub start_ts: i64,
    pub end_ts: i64,
    pub status: u8,

    pub num_choice_0: u64,
    pub num_choice_1: u64,
    pub num_choice_2: u64,
    pub num_choice_3: u64,
    pub num_choice_4: u64,
    pub num_choice_5: u64,

    pub _padding: [u8; 240],
}

impl Proposal {
    pub const MIN_PROPOSAL_VOTING_POWER: u64 = 1000;
    pub const MIN_TOTAL_PARTICIPATION_VOTING_POWER: u64 = 100000; // minimum participation voting power
    pub const MIN_PASS_BP: u64 = 6000; // 60%, the population is total_votes

    pub const STATUS_CREATED: u8 = 0;
    pub const STATUS_ACTIVATED: u8 = 1; // voting passed the minimum participation
    pub const STATUS_PASSED: u8 = 2;

    pub fn set_status(&mut self, override_status: Option<u8>) {
        if override_status.is_some() {
            self.status = override_status.unwrap();
            return;
        }
        if self.status == Proposal::STATUS_CREATED && self.has_quorum() {
            self.status = Proposal::STATUS_ACTIVATED;
        }
        if self.status == Proposal::STATUS_ACTIVATED && self.has_passed() {
            self.status = Proposal::STATUS_PASSED;
        }
    }

    pub fn cast_vote(&mut self, choice: u8, voting_power: u64) {
        match choice {
            0 => self.num_choice_0 += voting_power,
            1 => self.num_choice_1 += voting_power,
            2 => self.num_choice_2 += voting_power,
            3 => self.num_choice_3 += voting_power,
            4 => self.num_choice_4 += voting_power,
            5 => self.num_choice_5 += voting_power,
            _ => panic!("Invalid choice"),
        }
    }

    #[allow(dead_code)]
    pub fn winning_choice(&self) -> usize {
        let choices = [
            self.num_choice_0,
            self.num_choice_1,
            self.num_choice_2,
            self.num_choice_3,
            self.num_choice_4,
            self.num_choice_5,
        ];

        let mut max_choice = 0;
        let mut max_choice_idx = 0;
        for (idx, choice) in choices.iter().enumerate() {
            if *choice > max_choice {
                max_choice = *choice;
                max_choice_idx = idx;
            }
        }
        max_choice_idx
    }

    pub fn total_votes(&self) -> u64 {
        self.num_choice_0
            + self.num_choice_1
            + self.num_choice_2
            + self.num_choice_3
            + self.num_choice_4
            + self.num_choice_5
    }

    pub fn has_quorum(&self) -> bool {
        self.total_votes() > Proposal::MIN_TOTAL_PARTICIPATION_VOTING_POWER
    }

    pub fn has_passed(&self) -> bool {
        if !self.has_quorum() {
            return false;
        }
        let pass_threshold = self.total_votes() * Proposal::MIN_PASS_BP / 10000;
        self.num_choice_0 > pass_threshold
            || self.num_choice_1 > pass_threshold
            || self.num_choice_2 > pass_threshold
            || self.num_choice_3 > pass_threshold
            || self.num_choice_4 > pass_threshold
            || self.num_choice_5 > pass_threshold
    }

    pub fn has_votes(&self) -> bool {
        self.total_votes() > 0
    }
}

#[account]
#[derive(Copy, InitSpace)]
pub struct VoteRecord {
    pub ns: Pubkey,
    pub owner: Pubkey,
    pub proposal: Pubkey,

    pub lockup: Pubkey,
    pub choice: u8,
    pub voting_power: u64,

    pub _padding: [u8; 240],
}
