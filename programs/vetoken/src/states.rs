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

    // New field to track weighted start for voting/reward power
    // Added after existing fields for backward compatibility
    pub weighted_start_ts: i64,
    
    // Padding at the end for future field additions
    // Reduced from 240 to 232 bytes to accommodate weighted_start_ts
    pub _padding: [u8; 232],
}

impl Lockup {
    // Legacy size before adding weighted_start_ts field
    pub const LEGACY_SIZE: usize = 8  // discriminator
        + 32  // ns
        + 32  // owner
        + 8   // amount
        + 8   // start_ts
        + 8   // end_ts
        + 2   // target_rewards_pct
        + 2   // target_voting_pct
        + 240; // legacy padding (total: 340 bytes)

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

    pub fn  effective_start_ts(&self) -> i64 {
        if self.weighted_start_ts == 0 {
            self.start_ts
        } else {
            self.weighted_start_ts
        }
    }

    pub fn normalize_weighted_start_ts(&mut self, data_len: usize) {
        if data_len <= Self::LEGACY_SIZE && self.weighted_start_ts == 0 {
            // Legacy accounts lacked weighted_start_ts; default to start_ts.
            self.weighted_start_ts = self.start_ts;
        }
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

        let duration = (self.end_ts - self.effective_start_ts()) as u128;
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
                    weighted_start_ts: 0,
                    target_rewards_pct: 1000,
                    target_voting_pct: 5000,
                    _padding: [0; 232],
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
                    weighted_start_ts: 0,
                    target_rewards_pct: 100,
                    target_voting_pct: 2000,
                    _padding: [0; 232],
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
                    weighted_start_ts: 0,
                    target_rewards_pct: 100,
                    target_voting_pct: 2000,
                    _padding: [0; 232],
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
                    weighted_start_ts: 0,
                    target_rewards_pct: 100,
                    target_voting_pct: 2000,
                    _padding: [0; 232],
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
                    weighted_start_ts: 0,
                    target_rewards_pct: 100,
                    target_voting_pct: 2000,
                    _padding: [0; 232],
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
                    weighted_start_ts: 0,
                    target_rewards_pct: 100,
                    target_voting_pct: 2000,
                    _padding: [0; 232],
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
    fn test_weighted_start_ts_voting_power() {
        // Test Case 1: Attack scenario - small initial stake with max lock, then large top-up near expiry
        // Should get only ~1x multiplier due to short remaining time
        let ns = Namespace {
            token_mint: Pubkey::new_from_array([0; 32]),
            deployer: Pubkey::new_from_array([0; 32]),
            security_council: Pubkey::new_from_array([0; 32]),
            review_council: Pubkey::new_from_array([0; 32]),
            override_now: 0,
            lockup_default_target_rewards_pct: 100,
            lockup_default_target_voting_pct: 2000, // 20x max
            lockup_min_duration: 86400 * 14,         // 14 days
            lockup_min_amount: 1,
            lockup_max_saturation: 86400 * 365 * 4, // 4 years
            proposal_min_voting_power_for_quorum: 10000,
            proposal_min_pass_pct: 60,
            proposal_can_update_after_votes: false,
            lockup_amount: 0,
            proposal_nonce: 0,
            _padding: [0; 240],
        };

        // Simulate: 1 token locked for 4 years, then after 3.9 years add 999,999 tokens
        // weighted_start_ts should be very close to end_ts, giving minimal multiplier
        let four_years = 86400 * 365 * 4;
        let lockup_attack = Lockup {
            ns: Pubkey::new_from_array([0; 32]),
            owner: Pubkey::new_from_array([0; 32]),
            amount: 1_000_000,
            start_ts: 0,
            end_ts: four_years,
            // After top-up: old_tw = 1 * 4y, added_tw = 999999 * 0.1y
            // new_tw ≈ 100,003 years, duration ≈ 0.100003 years
            weighted_start_ts: four_years - 100_003, // ~3.9 years from T0
            target_rewards_pct: 100,
            target_voting_pct: 2000,
            _padding: [0; 232],
        };
        let vp_attack = lockup_attack.voting_power(&ns);
        // With only ~0.1 year duration, should be close to 1x (amount itself)
        assert!(
            vp_attack < 1_100_000,
            "Attack case should yield < 1.1x, got {}",
            vp_attack
        );

        // Test Case 2: Normal user locks full amount for 4 years from start
        // Should get full 20x multiplier
        let lockup_normal = Lockup {
            ns: Pubkey::new_from_array([0; 32]),
            owner: Pubkey::new_from_array([0; 32]),
            amount: 1_000_000,
            start_ts: 0,
            end_ts: four_years,
            weighted_start_ts: 0, // Same as start_ts
            target_rewards_pct: 100,
            target_voting_pct: 2000,
            _padding: [0; 232],
        };
        let vp_normal = lockup_normal.voting_power(&ns);
        assert_eq!(
            vp_normal, 20_000_000,
            "Normal 4-year lock should get 20x"
        );

        // Test Case 3: Gradual top-ups - 3 equal stakes over 2 years
        // Average lock time ~3 years, should get ~15x
        let lockup_gradual = Lockup {
            ns: Pubkey::new_from_array([0; 32]),
            owner: Pubkey::new_from_array([0; 32]),
            amount: 300_000,
            start_ts: 0,
            end_ts: four_years,
            // Weighted start should be around T0 + 1 year (average of 0, 1, 2 years)
            weighted_start_ts: four_years - (86400 * 365 * 3), // 3-year duration
            target_rewards_pct: 100,
            target_voting_pct: 2000,
            _padding: [0; 232],
        };
        let vp_gradual = lockup_gradual.voting_power(&ns);
        // 3 years is 75% of max saturation, should be between 100% and 2000%
        // Linear interpolation: 100% + (2000% - 100%) * (3y - 14d) / (4y - 14d) ≈ 1425%
        assert!(
            vp_gradual >= 4_000_000 && vp_gradual <= 5_000_000,
            "Gradual case should yield 13x-17x, got {}x",
            vp_gradual / 300_000
        );

        // Test Case 4: weighted_start_ts = 0 fallback to start_ts (legacy compatibility)
        let lockup_legacy = Lockup {
            ns: Pubkey::new_from_array([0; 32]),
            owner: Pubkey::new_from_array([0; 32]),
            amount: 10_000,
            start_ts: 0,
            end_ts: 86400 * 365, // 1 year
            weighted_start_ts: 0, // Should use start_ts
            target_rewards_pct: 100,
            target_voting_pct: 2000,
            _padding: [0; 232],
        };
        let vp_legacy = lockup_legacy.voting_power(&ns);
        // 1 year = 25% of 4 years, should get ~5.75x
        assert!(
            vp_legacy >= 50_000 && vp_legacy <= 60_000,
            "Legacy case (1y) should yield ~5-6x, got {}",
            vp_legacy
        );

        // Test Case 5: Minimum duration with weighted_start_ts
        // Should return 100% of the amount regardless of weighted_start_ts
        let min_duration = 86400 * 14;
        let lockup_min = Lockup {
            ns: Pubkey::new_from_array([0; 32]),
            owner: Pubkey::new_from_array([0; 32]),
            amount: 10_000,
            start_ts: 0,
            end_ts: min_duration,
            weighted_start_ts: 0,
            target_rewards_pct: 100,
            target_voting_pct: 2000,
            _padding: [0; 232],
        };
        let vp_min = lockup_min.voting_power(&ns);
        assert_eq!(vp_min, 10_000, "Min duration should yield 1x (100%)");
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
