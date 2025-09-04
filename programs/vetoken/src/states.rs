use anchor_lang::{prelude::*, AnchorDeserialize};
use std::convert::TryInto;

const MAX_VOTING_CHOICES: usize = 6;

#[account]
#[derive(Copy, InitSpace)]
pub struct Namespace {
    // Seeds: [b"namespace", token_mint.key().as_ref(), deployer.key().as_ref()]
    pub token_mint: Pubkey,
    pub deployer: Pubkey,

    // Config
    pub security_council: Pubkey,
    pub review_council: Pubkey,
    pub override_now: i64,
    pub lockup_default_target_rewards_pct: u16,
    pub lockup_default_target_voting_pct: u16,
    pub lockup_min_duration: i64,
    pub lockup_min_amount: u64,
    pub lockup_max_saturation: u64,
    pub proposal_min_voting_power_for_quorum: u64,
    pub proposal_min_pass_pct: u16,
    pub proposal_can_update_after_votes: bool,

    // Realtime Stats
    pub lockup_amount: u64,
    pub proposal_nonce: u32,

    pub _padding: [u8; 240],
}

impl Namespace {
    pub fn now(&self) -> i64 {
        if self.override_now != 0 {
            return self.override_now;
        }

        Clock::get()
            .expect("we should be able to get the clock timestamp")
            .unix_timestamp
    }

    pub fn valid(&self) -> bool {
        self.lockup_min_duration > 0
            && self.lockup_min_amount > 0
            && self.lockup_max_saturation > (self.lockup_min_duration as u64)
            && self.lockup_default_target_rewards_pct >= 100
            && self.lockup_default_target_voting_pct >= 100
            && self.lockup_default_target_voting_pct <= 2500 // max 25x
            && self.proposal_min_voting_power_for_quorum > 0
            && self.proposal_min_pass_pct > 0
            && self.proposal_min_pass_pct <= 100
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

    pub target_rewards_pct: u16, // in percent
    pub target_voting_pct: u16,  // in percent

    pub _padding: [u8; 240],
}

impl Lockup {
    pub fn min_end_ts(&self, ns: &Namespace) -> i64 {
        ns.now()
            .checked_add(ns.lockup_min_duration)
            .expect("should not overflow")
    }

    pub fn valid(&self, ns: &Namespace) -> bool {
        self.amount >= ns.lockup_min_amount
            && self.start_ts >= 0
            && (self.end_ts >= self.min_end_ts(ns) || self.end_ts == 0)
            && (self.end_ts >= self.start_ts || self.end_ts == 0)
            && self.target_voting_pct >= 100
            && self.target_voting_pct <= 2500 // max 25x
    }

    /*
     * Voting power is based on the target_voting_pct
     * Summary:
     * 1. Check if the lockup has expired or is invalid
     * 2. Calculate max voting power based on amount and target percentage
     * 3. Handle minimum duration case (return 100% of amount)
     * 4. Handle maximum saturation case (return max voting power)
     * 5. For durations between min and max, calculate a linear increase in voting power
     *
     *                  Voting Power
     *                   ^
     *                   |
     * Max Voting Power  |           ----
     *                   |         /
     *                   |        /
     *                   |       /
     *                   |      /
     *                   |     /
     *             100%  |    /
     *                   | ---
     *                   +---------------------> Lockup Time (EndTs - StartTs)
     *                     MinTime   MaxTime
     */
    pub fn voting_power(&self, ns: &Namespace) -> u64 {
        let now = ns.now();

        if now >= self.end_ts {
            return 0;
        }
        if self.end_ts <= self.start_ts {
            return 0;
        }

        let duration = (self.end_ts - self.start_ts) as u128;
        let max_voting_power = (self.amount as u128 * self.target_voting_pct as u128) / 100;
        if duration <= ns.lockup_min_duration as u128 {
            return self.amount; // minimal 100% of the amount
        }
        if duration >= ns.lockup_max_saturation as u128 {
            return max_voting_power.try_into().expect("should not overflow");
        }

        let amount = self.amount as u128;

        let ret = amount
            + (max_voting_power - amount) * (duration - ns.lockup_min_duration as u128)
                / ((ns.lockup_max_saturation - ns.lockup_min_duration as u64) as u128);

        ret.try_into().expect("should not overflow")
    }

    // rewards_power is the voting power that can receive rewards based on the target_rewards_pct
    // it's not used in this program, but will be consumed by other programs
    #[allow(dead_code)]
    pub fn rewards_power(&self, ns: &Namespace) -> u64 {
        self.voting_power(ns)
            .checked_mul(self.target_rewards_pct as u64)
            .expect("should not overflow")
            .checked_div(100)
            .expect("should not overflow")
    }
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    // Seeds: [b"proposal", ns.key().as_ref(), ns.proposal_nonce.to_le_bytes().as_ref()]
    pub ns: Pubkey,
    pub nonce: u32,
    pub owner: Pubkey,

    pub start_ts: i64,
    pub end_ts: i64,
    pub status: u8, // not used at the moment, but a placeholder for future use
    pub voting_power_choices: [u64; MAX_VOTING_CHOICES], // cumulative voting power for each choice

    #[max_len(256)]
    pub uri: String,

    pub _padding: [u8; 240],
}

impl Proposal {
    pub fn valid(&self) -> bool {
        self.uri.len() <= 255 && self.start_ts < self.end_ts
    }

    pub fn can_update(&self) -> bool {
        if self.total_voting_power() > 0 {
            return false;
        }
        true
    }

    pub fn cast_vote(&mut self, choice: u8, voting_power: u64) {
        match choice {
            0..=5 => {
                self.voting_power_choices[choice as usize] = self.voting_power_choices
                    [choice as usize]
                    .checked_add(voting_power)
                    .expect("should not overflow")
            }
            _ => panic!("Invalid choice"),
        }
    }

    pub fn total_voting_power(&self) -> u64 {
        self.voting_power_choices.iter().fold(0, |acc, &choice| {
            acc.checked_add(choice).expect("should not overflow")
        })
    }

    #[allow(dead_code)]
    pub fn has_quorum(&self, ns: &Namespace) -> bool {
        self.total_voting_power() > ns.proposal_min_voting_power_for_quorum
    }

    #[allow(dead_code)]
    pub fn has_passed(&self, ns: &Namespace) -> bool {
        // Check if the proposal has quorum
        if !self.has_quorum(ns) {
            return false;
        }
        // Check if the proposal has ended
        if ns.now() < self.end_ts {
            return false;
        }
        let pass_threshold = self
            .total_voting_power()
            .checked_mul(ns.proposal_min_pass_pct as u64)
            .expect("should not overflow")
            .checked_div(100)
            .expect("should not overflow");
        self.voting_power_choices
            .iter()
            .any(|&choice| choice > pass_threshold)
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

    pub _padding: [u8; 32],
}

impl VoteRecord {
    pub fn valid(&self) -> bool {
        (self.choice as usize) < MAX_VOTING_CHOICES
    }
}

#[account]
#[derive(Copy, InitSpace)]
pub struct Distribution {
    // Seeds: [b"distribution", ns.key().as_ref(), uuid.key().as_ref()]
    pub ns: Pubkey,
    pub uuid: Pubkey,
    pub cosigner_1: Pubkey,
    pub cosigner_2: Pubkey,
    pub start_ts: i64,
    pub distribution_token_mint: Pubkey,

    pub _padding: [u8; 240],
}

#[account]
#[derive(Copy, InitSpace)]
pub struct DistributionClaim {
    // Seeds: [b"claim", ns.key().as_ref(), args.cosigned_msg.as_ref()]
    pub ns: Pubkey,
    pub distribution: Pubkey,
    pub claimant: Pubkey,
    pub distribution_token_mint: Pubkey,
    pub amount: u64,
    pub cosigned_msg: [u8; 32], // sha256 hash of the cosigned message

    pub _padding: [u8; 240],
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lockup_voting_power() {
        let test_cases = vec![
            (
                "Case 1",
                Namespace {
                    token_mint: Pubkey::new_from_array([0; 32]),
                    deployer: Pubkey::new_from_array([0; 32]),
                    security_council: Pubkey::new_from_array([0; 32]),
                    review_council: Pubkey::new_from_array([0; 32]),
                    override_now: 1717796555,
                    lockup_default_target_rewards_pct: 100,
                    lockup_default_target_voting_pct: 2000,
                    lockup_min_duration: 86400,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 864000,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_pct: 60,
                    proposal_can_update_after_votes: true,
                    lockup_amount: 10000,
                    proposal_nonce: 0,
                    _padding: [0; 240],
                },
                Lockup {
                    ns: Pubkey::new_from_array([0; 32]),
                    owner: Pubkey::new_from_array([0; 32]),
                    amount: 10000,
                    start_ts: 0,
                    end_ts: 86400,
                    target_rewards_pct: 1000,
                    target_voting_pct: 5000,
                    _padding: [0; 240],
                },
                0, // end_ts expired, because override_now > end_ts
            ),
            (
                "Case 2",
                Namespace {
                    token_mint: Pubkey::new_from_array([0; 32]),
                    deployer: Pubkey::new_from_array([0; 32]),
                    security_council: Pubkey::new_from_array([0; 32]),
                    review_council: Pubkey::new_from_array([0; 32]),
                    override_now: 123,
                    lockup_default_target_rewards_pct: 100,
                    lockup_default_target_voting_pct: 2000,
                    lockup_min_duration: 86400,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 86400 * 365 * 4,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_pct: 60,
                    proposal_can_update_after_votes: true,
                    lockup_amount: 10000,
                    proposal_nonce: 0,
                    _padding: [0; 240],
                },
                Lockup {
                    ns: Pubkey::new_from_array([0; 32]),
                    owner: Pubkey::new_from_array([0; 32]),
                    amount: 10000,
                    start_ts: 0,
                    end_ts: 86400 * 14,
                    target_rewards_pct: 100,
                    target_voting_pct: 2000,
                    _padding: [0; 240],
                },
                11692,
            ),
            // Add more test cases here...
            (
                "Case 3",
                Namespace {
                    token_mint: Pubkey::new_from_array([0; 32]),
                    deployer: Pubkey::new_from_array([0; 32]),
                    security_council: Pubkey::new_from_array([0; 32]),
                    review_council: Pubkey::new_from_array([0; 32]),
                    override_now: 1717796555,
                    lockup_default_target_rewards_pct: 100,
                    lockup_default_target_voting_pct: 2000,
                    lockup_min_duration: 86400,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 864000,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_pct: 60,
                    proposal_can_update_after_votes: true,
                    lockup_amount: 10000,
                    proposal_nonce: 0,
                    _padding: [0; 240],
                },
                Lockup {
                    ns: Pubkey::new_from_array([0; 32]),
                    owner: Pubkey::new_from_array([0; 32]),
                    amount: 10000,
                    start_ts: 0,
                    end_ts: 86400,
                    target_rewards_pct: 100,
                    target_voting_pct: 2000,
                    _padding: [0; 240],
                },
                0, // 0 because of the target_rewards_pct
            ),
            (
                "Case 4",
                Namespace {
                    token_mint: Pubkey::new_from_array([0; 32]),
                    deployer: Pubkey::new_from_array([0; 32]),
                    security_council: Pubkey::new_from_array([0; 32]),
                    review_council: Pubkey::new_from_array([0; 32]),
                    override_now: 1,
                    lockup_default_target_rewards_pct: 100,
                    lockup_default_target_voting_pct: 2000,
                    lockup_min_duration: 86400,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 86400,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_pct: 60,
                    proposal_can_update_after_votes: true,
                    lockup_amount: 10000,
                    proposal_nonce: 0,
                    _padding: [0; 240],
                },
                Lockup {
                    ns: Pubkey::new_from_array([0; 32]),
                    owner: Pubkey::new_from_array([0; 32]),
                    amount: 10000,
                    start_ts: 0,
                    end_ts: 86400,
                    target_rewards_pct: 100,
                    target_voting_pct: 2000,
                    _padding: [0; 240],
                },
                10000, // because we just hit the minimal duration, thus only getting 100% of the amount
            ),
            (
                "Case 5",
                Namespace {
                    token_mint: Pubkey::new_from_array([0; 32]),
                    deployer: Pubkey::new_from_array([0; 32]),
                    security_council: Pubkey::new_from_array([0; 32]),
                    review_council: Pubkey::new_from_array([0; 32]),
                    override_now: 1717796555,
                    lockup_default_target_rewards_pct: 100,
                    lockup_default_target_voting_pct: 2000,
                    lockup_min_duration: 3600 * 24 * 14,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 126144000,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_pct: 60,
                    proposal_can_update_after_votes: true,
                    lockup_amount: 10000,
                    proposal_nonce: 0,
                    _padding: [0; 240],
                },
                Lockup {
                    ns: Pubkey::new_from_array([0; 32]),
                    owner: Pubkey::new_from_array([0; 32]),
                    amount: 10000,
                    start_ts: 0,
                    end_ts: 1717796555 + 3600 * 24 * 180,
                    target_rewards_pct: 100,
                    target_voting_pct: 2000,
                    _padding: [0; 240],
                },
                200000, //  should be 2000%
            ),
            (
                "Case 6",
                Namespace {
                    token_mint: Pubkey::new_from_array([0; 32]),
                    deployer: Pubkey::new_from_array([0; 32]),
                    security_council: Pubkey::new_from_array([0; 32]),
                    review_council: Pubkey::new_from_array([0; 32]),
                    override_now: 1717796555,
                    lockup_default_target_rewards_pct: 100,
                    lockup_default_target_voting_pct: 2000,
                    lockup_min_duration: 86400 * 14,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 126144000,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_pct: 60,
                    proposal_can_update_after_votes: true,
                    lockup_amount: 10000,
                    proposal_nonce: 0,
                    _padding: [0; 240],
                },
                Lockup {
                    ns: Pubkey::new_from_array([0; 32]),
                    owner: Pubkey::new_from_array([0; 32]),
                    amount: 10000,
                    start_ts: 0,
                    end_ts: 1717796555 + 3600 * 24 * 365 * 3 / 2,
                    target_rewards_pct: 100,
                    target_voting_pct: 2000,
                    _padding: [0; 240],
                },
                200000, //  should be 20x of the amount
            ),
        ];

        for (name, ns, lockup, expected_voting_power) in test_cases {
            let voting_power = lockup.voting_power(&ns);
            assert_eq!(voting_power, expected_voting_power, "{}", name);
        }
    }

    #[test]
    fn test_has_quorum_false() {
        let ns = Namespace {
            token_mint: Pubkey::new_from_array([0; 32]),
            deployer: Pubkey::new_from_array([0; 32]),
            security_council: Pubkey::new_from_array([0; 32]),
            review_council: Pubkey::new_from_array([0; 32]),
            override_now: 1,
            lockup_default_target_rewards_pct: 100,
            lockup_default_target_voting_pct: 5000,
            lockup_min_duration: 86400,
            lockup_min_amount: 1000,
            lockup_max_saturation: 86400,
            proposal_min_voting_power_for_quorum: 100000,
            proposal_min_pass_pct: 60,
            proposal_can_update_after_votes: true,
            lockup_amount: 10000,
            proposal_nonce: 0,
            _padding: [0; 240],
        };
        let proposal = Proposal {
            ns: Pubkey::new_from_array([0; 32]),
            nonce: 0,
            owner: Pubkey::new_from_array([0; 32]),
            uri: "https://123".to_owned(),
            start_ts: 0,
            end_ts: 100,
            status: 0,
            voting_power_choices: [10000, 0, 0, 0, 0, 0],
            _padding: [0; 240],
        };
        assert_eq!(proposal.has_quorum(&ns), false);
    }

    #[test]
    fn test_has_quorum_true() {
        let ns = Namespace {
            token_mint: Pubkey::new_from_array([0; 32]),
            deployer: Pubkey::new_from_array([0; 32]),
            security_council: Pubkey::new_from_array([0; 32]),
            review_council: Pubkey::new_from_array([0; 32]),
            override_now: 90, // now() < proposal.end_ts
            lockup_default_target_rewards_pct: 100,
            lockup_default_target_voting_pct: 5000,
            lockup_min_duration: 86400,
            lockup_min_amount: 1000,
            lockup_max_saturation: 86400,
            proposal_min_voting_power_for_quorum: 100,
            proposal_min_pass_pct: 60,
            proposal_can_update_after_votes: true,
            lockup_amount: 10000,
            proposal_nonce: 0,
            _padding: [0; 240],
        };
        let proposal = Proposal {
            ns: Pubkey::new_from_array([0; 32]),
            nonce: 0,
            owner: Pubkey::new_from_array([0; 32]),
            uri: "https://123".to_owned(),
            start_ts: 0,
            end_ts: 100,
            status: 0,
            voting_power_choices: [100, 100, 0, 0, 0, 0],
            _padding: [0; 240],
        };
        assert_eq!(proposal.has_quorum(&ns), true);
    }

    #[test]
    fn test_has_passed() {
        let ns = Namespace {
            token_mint: Pubkey::new_from_array([0; 32]),
            deployer: Pubkey::new_from_array([0; 32]),
            security_council: Pubkey::new_from_array([0; 32]),
            review_council: Pubkey::new_from_array([0; 32]),
            override_now: 101,
            lockup_default_target_rewards_pct: 100,
            lockup_default_target_voting_pct: 5000,
            lockup_min_duration: 86400,
            lockup_min_amount: 1000,
            lockup_max_saturation: 86400,
            proposal_min_voting_power_for_quorum: 100,
            proposal_min_pass_pct: 60,
            proposal_can_update_after_votes: true,
            lockup_amount: 10000,
            proposal_nonce: 0,
            _padding: [0; 240],
        };
        let proposal = Proposal {
            ns: Pubkey::new_from_array([0; 32]),
            nonce: 0,
            owner: Pubkey::new_from_array([0; 32]),
            uri: "https://123".to_owned(),
            start_ts: 0,
            end_ts: 100,
            status: 0,
            voting_power_choices: [10000, 0, 0, 0, 0, 0],
            _padding: [0; 240],
        };
        assert_eq!(proposal.has_passed(&ns), true);
    }
}
