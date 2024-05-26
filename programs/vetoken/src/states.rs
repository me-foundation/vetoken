use std::cmp::max;

use anchor_lang::{prelude::*, AnchorDeserialize};

#[account]
#[derive(Copy, InitSpace)]
pub struct Namespace {
    // Seeds: [b"namespace", token_mint.key().as_ref(), deployer.key().as_ref()]
    pub token_mint: Pubkey,
    pub deployer: Pubkey,

    // Config
    pub security_council: Pubkey,
    pub review_council: Pubkey,
    pub debug_ts_offset: i64,
    pub lockup_default_target_rewards_bp: u16,
    pub lockup_default_target_voting_bp: u16,
    pub lockup_min_duration: i64,
    pub lockup_min_amount: u64,
    pub lockup_max_saturation: u64,
    pub proposal_min_voting_power_for_quorum: u64,
    pub proposal_min_pass_bp: u16,

    // Realtime Stats
    pub lockup_amount: u64,
    pub proposal_nonce: u32,

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
    // Seeds: [b"lockup", ns.key().as_ref(), owner.key().as_ref()]
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
    pub fn min_end_ts(&self, ns: &Namespace) -> i64 {
        ns.now() + ns.lockup_min_duration
    }

    // Linear decay of the voting power based on the target_voting_bp
    pub fn voting_power(&self, ns: &Namespace) -> u64 {
        let now = ns.now();

        if now >= self.end_ts {
            return self.amount;
        }

        let max_bonus = self
            .amount
            .checked_mul(self.target_voting_bp as u64)
            .expect("should not overflow")
            .checked_div(10000)
            .expect("should not overflow");

        if now <= self.start_ts {
            return self
                .amount
                .checked_add(max_bonus)
                .expect("should not overflow");
        };

        let remainning_time = max(ns.lockup_max_saturation, (self.end_ts - now) as u64);

        let bonus = max_bonus
            .checked_mul(remainning_time)
            .expect("should not overflow")
            .checked_div(ns.lockup_max_saturation)
            .expect("should not overflow");

        self.amount.checked_add(bonus).expect("should not overflow")
    }

    // rewards_power is the voting power that can receive rewards based on the target_rewards_bp
    #[allow(dead_code)]
    pub fn rewards_power(&self, ns: &Namespace) -> u64 {
        self.voting_power(ns) * (self.target_rewards_bp as u64) / 10000
    }
}

#[account]
#[derive(Copy, InitSpace)]
pub struct Proposal {
    // Seeds: [b"proposal", ns.key().as_ref(), ns.proposal_nonce.to_le_bytes().as_ref()]
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
    pub const STATUS_CREATED: u8 = 0;
    pub const STATUS_ACTIVATED: u8 = 1; // voting passed the minimum participation
    pub const STATUS_PASSED: u8 = 2;

    pub fn set_status(&mut self, ns: &Namespace, override_status: Option<u8>) {
        if override_status.is_some() {
            self.status = override_status.unwrap();
            return;
        }
        if self.status == Proposal::STATUS_CREATED && self.has_quorum(ns) {
            self.status = Proposal::STATUS_ACTIVATED;
        }
        if self.status == Proposal::STATUS_ACTIVATED && self.has_passed(ns) {
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

    pub fn has_quorum(&self, ns: &Namespace) -> bool {
        self.total_votes() > ns.proposal_min_voting_power_for_quorum
    }

    pub fn has_passed(&self, ns: &Namespace) -> bool {
        if !self.has_quorum(ns) {
            return false;
        }
        let pass_threshold = self.total_votes() * (ns.proposal_min_pass_bp as u64) / 10000;
        self.num_choice_0 > pass_threshold
            || self.num_choice_1 > pass_threshold
            || self.num_choice_2 > pass_threshold
            || self.num_choice_3 > pass_threshold
            || self.num_choice_4 > pass_threshold
            || self.num_choice_5 > pass_threshold
    }
}

#[account]
#[derive(Copy, InitSpace)]
pub struct VoteRecord {
    // Seeds: [b"vote_record", ns.key().as_ref(), owner.key().as_ref(), proposal.key().as_ref()]
    pub ns: Pubkey,
    pub owner: Pubkey,
    pub proposal: Pubkey,

    pub lockup: Pubkey,
    pub choice: u8,
    pub voting_power: u64,

    pub _padding: [u8; 240],
}
