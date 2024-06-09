use std::convert::TryInto;

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
    pub override_now: i64,
    pub lockup_default_target_rewards_bp: u16,
    pub lockup_default_target_voting_bp: u16,
    pub lockup_min_duration: i64,
    pub lockup_min_amount: u64,
    pub lockup_max_saturation: u64,
    pub proposal_min_voting_power_for_quorum: u64,
    pub proposal_min_pass_bp: u16,
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
        ns.now()
            .checked_add(ns.lockup_min_duration)
            .expect("should not overflow")
    }

    /*
     * Linear decay of the voting power based on the target_voting_bp
     *                  Voting Power
     *                   ^
     *                   |
     * Max Voting Power  |  \
     *                   |   \
     *                   |    \
     *                   |     \
     *                   |      \
     *                   |       \
     *                   |        \
     *                   |         \
     *                   +---------------------> Time
     *                  Start_ts           End_ts
     */
    pub fn voting_power(&self, ns: &Namespace) -> u64 {
        let now = ns.now();

        if now >= self.end_ts {
            return 0;
        }

        let max_voting_power = (self.amount as u128 * self.target_voting_bp as u128) / 10000;

        let remaining_time = u128::min(
            ns.lockup_max_saturation as u128,
            (self.end_ts - now) as u128,
        );

        (max_voting_power * remaining_time / ns.lockup_max_saturation as u128)
            .try_into()
            .expect("should not overflow")
    }

    // rewards_power is the voting power that can receive rewards based on the target_rewards_bp
    // it's not used in this program, but will be consumed by other programs
    #[allow(dead_code)]
    pub fn rewards_power(&self, ns: &Namespace) -> u64 {
        self.voting_power(ns)
            .checked_mul(self.target_rewards_bp as u64)
            .expect("should not overflow")
            .checked_div(10000)
            .expect("should not overflow")
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
    pub voting_power_choices: [u64; 6], // cumulative voting power for each choice, we use max of 6 choices

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

    pub fn can_update(&self, ns: &Namespace) -> bool {
        if self.total_voting_power() > 0 && !ns.proposal_can_update_after_votes {
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
        self.voting_power_choices.iter().sum()
    }

    pub fn has_quorum(&self, ns: &Namespace) -> bool {
        self.total_voting_power() > ns.proposal_min_voting_power_for_quorum
    }

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
            .checked_mul(ns.proposal_min_pass_bp as u64)
            .expect("should not overflow")
            .checked_div(10000)
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

    pub _padding: [u8; 240],
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
                    lockup_default_target_rewards_bp: 1000,
                    lockup_default_target_voting_bp: 5000,
                    lockup_min_duration: 86400,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 864000,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_bp: 6000,
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
                    target_rewards_bp: 1000,
                    target_voting_bp: 5000,
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
                    override_now: 1,
                    lockup_default_target_rewards_bp: 1000,
                    lockup_default_target_voting_bp: 5000,
                    lockup_min_duration: 86400,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 86400,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_bp: 6000,
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
                    target_rewards_bp: 5000,
                    target_voting_bp: 1000,
                    _padding: [0; 240],
                },
                999, //  should be closer to 10% (target_voting_bp) of the amount
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
                    lockup_default_target_rewards_bp: 1000,
                    lockup_default_target_voting_bp: 5000,
                    lockup_min_duration: 86400,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 864000,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_bp: 6000,
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
                    target_rewards_bp: 0,
                    target_voting_bp: 0,
                    _padding: [0; 240],
                },
                0, // 0 because of the target_rewards_bp
            ),
            (
                "Case 4",
                Namespace {
                    token_mint: Pubkey::new_from_array([0; 32]),
                    deployer: Pubkey::new_from_array([0; 32]),
                    security_council: Pubkey::new_from_array([0; 32]),
                    review_council: Pubkey::new_from_array([0; 32]),
                    override_now: 1,
                    lockup_default_target_rewards_bp: 1000,
                    lockup_default_target_voting_bp: 5000,
                    lockup_min_duration: 86400,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 86400,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_bp: 6000,
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
                    target_rewards_bp: 5000,
                    target_voting_bp: 40000,
                    _padding: [0; 240],
                },
                39999, //  should be closer to 400% (target_voting_bp) of the amount
            ),
            (
                "Case 5",
                Namespace {
                    token_mint: Pubkey::new_from_array([0; 32]),
                    deployer: Pubkey::new_from_array([0; 32]),
                    security_council: Pubkey::new_from_array([0; 32]),
                    review_council: Pubkey::new_from_array([0; 32]),
                    override_now: 1717796555,
                    lockup_default_target_rewards_bp: 1000,
                    lockup_default_target_voting_bp: 5000,
                    lockup_min_duration: 86400,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 126144000,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_bp: 6000,
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
                    end_ts: 1717796555 + 3600 * 24 * 14,
                    target_rewards_bp: 5000,
                    target_voting_bp: 40000,
                    _padding: [0; 240],
                },
                383, //  should be closer to 14 days out of the 4 years satuation
            ),
            (
                "Case 6",
                Namespace {
                    token_mint: Pubkey::new_from_array([0; 32]),
                    deployer: Pubkey::new_from_array([0; 32]),
                    security_council: Pubkey::new_from_array([0; 32]),
                    review_council: Pubkey::new_from_array([0; 32]),
                    override_now: 1717796555,
                    lockup_default_target_rewards_bp: 1000,
                    lockup_default_target_voting_bp: 5000,
                    lockup_min_duration: 86400,
                    lockup_min_amount: 1000,
                    lockup_max_saturation: 126144000,
                    proposal_min_voting_power_for_quorum: 10000,
                    proposal_min_pass_bp: 6000,
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
                    end_ts: 1717796555 + 3600 * 24 * 365,
                    target_rewards_bp: 5000,
                    target_voting_bp: 40000,
                    _padding: [0; 240],
                },
                10000, //  should be closer to 1 year out of the 4 years satuation
            ),
        ];

        for (name, ns, lockup, expected_voting_power) in test_cases {
            let voting_power = lockup.voting_power(&ns);
            assert_eq!(voting_power, expected_voting_power, "{}", name);
        }
    }

    #[test]
    fn test_set_status_created() {
        let ns = Namespace {
            token_mint: Pubkey::new_from_array([0; 32]),
            deployer: Pubkey::new_from_array([0; 32]),
            security_council: Pubkey::new_from_array([0; 32]),
            review_council: Pubkey::new_from_array([0; 32]),
            override_now: 1,
            lockup_default_target_rewards_bp: 1000,
            lockup_default_target_voting_bp: 5000,
            lockup_min_duration: 86400,
            lockup_min_amount: 1000,
            lockup_max_saturation: 86400,
            proposal_min_voting_power_for_quorum: 100000,
            proposal_min_pass_bp: 6000,
            proposal_can_update_after_votes: true,
            lockup_amount: 10000,
            proposal_nonce: 0,
            _padding: [0; 240],
        };
        let mut proposal = Proposal {
            ns: Pubkey::new_from_array([0; 32]),
            nonce: 0,
            owner: Pubkey::new_from_array([0; 32]),
            uri: [0; 256],
            start_ts: 0,
            end_ts: 100,
            status: 0,
            voting_power_choices: [10000, 0, 0, 0, 0, 0],
            _padding: [0; 240],
        };
        proposal.set_status(&ns, None);
        assert_eq!(proposal.status, Proposal::STATUS_CREATED);
    }

    #[test]
    fn test_set_status_activated() {
        let ns = Namespace {
            token_mint: Pubkey::new_from_array([0; 32]),
            deployer: Pubkey::new_from_array([0; 32]),
            security_council: Pubkey::new_from_array([0; 32]),
            review_council: Pubkey::new_from_array([0; 32]),
            override_now: 90, // now() < proposal.end_ts
            lockup_default_target_rewards_bp: 1000,
            lockup_default_target_voting_bp: 5000,
            lockup_min_duration: 86400,
            lockup_min_amount: 1000,
            lockup_max_saturation: 86400,
            proposal_min_voting_power_for_quorum: 100,
            proposal_min_pass_bp: 6000,
            proposal_can_update_after_votes: true,
            lockup_amount: 10000,
            proposal_nonce: 0,
            _padding: [0; 240],
        };
        let mut proposal = Proposal {
            ns: Pubkey::new_from_array([0; 32]),
            nonce: 0,
            owner: Pubkey::new_from_array([0; 32]),
            uri: [0; 256],
            start_ts: 0,
            end_ts: 100,
            status: 0,
            voting_power_choices: [100, 100, 0, 0, 0, 0],
            _padding: [0; 240],
        };
        proposal.set_status(&ns, None);
        assert_eq!(proposal.status, Proposal::STATUS_ACTIVATED);
    }

    #[test]
    fn test_set_status_passed() {
        let ns = Namespace {
            token_mint: Pubkey::new_from_array([0; 32]),
            deployer: Pubkey::new_from_array([0; 32]),
            security_council: Pubkey::new_from_array([0; 32]),
            review_council: Pubkey::new_from_array([0; 32]),
            override_now: 101,
            lockup_default_target_rewards_bp: 1000,
            lockup_default_target_voting_bp: 5000,
            lockup_min_duration: 86400,
            lockup_min_amount: 1000,
            lockup_max_saturation: 86400,
            proposal_min_voting_power_for_quorum: 100,
            proposal_min_pass_bp: 6000,
            proposal_can_update_after_votes: true,
            lockup_amount: 10000,
            proposal_nonce: 0,
            _padding: [0; 240],
        };
        let mut proposal = Proposal {
            ns: Pubkey::new_from_array([0; 32]),
            nonce: 0,
            owner: Pubkey::new_from_array([0; 32]),
            uri: [0; 256],
            start_ts: 0,
            end_ts: 100,
            status: 0,
            voting_power_choices: [10000, 0, 0, 0, 0, 0],
            _padding: [0; 240],
        };
        proposal.set_status(&ns, None);
        assert_eq!(proposal.status, Proposal::STATUS_PASSED);
    }
}
