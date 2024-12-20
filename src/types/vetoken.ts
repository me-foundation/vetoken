export type Vetoken = {
  "version": "0.1.0",
  "name": "vetoken",
  "instructions": [
    {
      "name": "initNamespace",
      "accounts": [
        {
          "name": "deployer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "securityCouncil",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reviewCouncil",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateNamespace",
      "accounts": [
        {
          "name": "securityCouncil",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateNamespaceArgs"
          }
        }
      ]
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockup",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockupTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "StakeArgs"
          }
        }
      ]
    },
    {
      "name": "stakeTo",
      "accounts": [
        {
          "name": "securityCouncil",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockup",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockupTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "StakeToArgs"
          }
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockup",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockupTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initProposal",
      "accounts": [
        {
          "name": "reviewCouncil",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitProposalArgs"
          }
        }
      ]
    },
    {
      "name": "updateProposal",
      "accounts": [
        {
          "name": "reviewCouncil",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateProposalArgs"
          }
        }
      ]
    },
    {
      "name": "vote",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockup",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "VoteArgs"
          }
        }
      ]
    },
    {
      "name": "initDistribution",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "uuid",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitDistributionArgs"
          }
        }
      ]
    },
    {
      "name": "updateDistribution",
      "accounts": [
        {
          "name": "securityCouncil",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateDistributionArgs"
          }
        }
      ]
    },
    {
      "name": "claimFromDistribution",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "claimant",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cosigner1",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "cosigner2",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "distributionClaim",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Use multiple token accounts to shard the writes"
          ]
        },
        {
          "name": "claimantTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "ClaimFromDistributionArgs"
          }
        }
      ]
    },
    {
      "name": "withdrawFromDistribution",
      "accounts": [
        {
          "name": "securityCouncil",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "distribution",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "securityCouncilTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "namespace",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "deployer",
            "type": "publicKey"
          },
          {
            "name": "securityCouncil",
            "type": "publicKey"
          },
          {
            "name": "reviewCouncil",
            "type": "publicKey"
          },
          {
            "name": "overrideNow",
            "type": "i64"
          },
          {
            "name": "lockupDefaultTargetRewardsPct",
            "type": "u16"
          },
          {
            "name": "lockupDefaultTargetVotingPct",
            "type": "u16"
          },
          {
            "name": "lockupMinDuration",
            "type": "i64"
          },
          {
            "name": "lockupMinAmount",
            "type": "u64"
          },
          {
            "name": "lockupMaxSaturation",
            "type": "u64"
          },
          {
            "name": "proposalMinVotingPowerForQuorum",
            "type": "u64"
          },
          {
            "name": "proposalMinPassPct",
            "type": "u16"
          },
          {
            "name": "proposalCanUpdateAfterVotes",
            "type": "bool"
          },
          {
            "name": "lockupAmount",
            "type": "u64"
          },
          {
            "name": "proposalNonce",
            "type": "u32"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "lockup",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ns",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "targetRewardsPct",
            "type": "u16"
          },
          {
            "name": "targetVotingPct",
            "type": "u16"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ns",
            "type": "publicKey"
          },
          {
            "name": "nonce",
            "type": "u32"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "votingPowerChoices",
            "type": {
              "array": [
                "u64",
                6
              ]
            }
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ns",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "proposal",
            "type": "publicKey"
          },
          {
            "name": "lockup",
            "type": "publicKey"
          },
          {
            "name": "choice",
            "type": "u8"
          },
          {
            "name": "votingPower",
            "type": "u64"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "distribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ns",
            "type": "publicKey"
          },
          {
            "name": "uuid",
            "type": "publicKey"
          },
          {
            "name": "cosigner1",
            "type": "publicKey"
          },
          {
            "name": "cosigner2",
            "type": "publicKey"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "distributionTokenMint",
            "type": "publicKey"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "distributionClaim",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ns",
            "type": "publicKey"
          },
          {
            "name": "distribution",
            "type": "publicKey"
          },
          {
            "name": "claimant",
            "type": "publicKey"
          },
          {
            "name": "distributionTokenMint",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "cosignedMsg",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ClaimFromDistributionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "cosignedMsg",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "InitDistributionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cosigner1",
            "type": "publicKey"
          },
          {
            "name": "cosigner2",
            "type": "publicKey"
          },
          {
            "name": "startTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "InitProposalArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "StakeToArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "disableRewards",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "StakeArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "endTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "UpdateDistributionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "UpdateNamespaceArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "securityCouncil",
            "type": "publicKey"
          },
          {
            "name": "reviewCouncil",
            "type": "publicKey"
          },
          {
            "name": "lockupDefaultTargetRewardsPct",
            "type": "u16"
          },
          {
            "name": "lockupDefaultTargetVotingPct",
            "type": "u16"
          },
          {
            "name": "lockupMinDuration",
            "type": "i64"
          },
          {
            "name": "lockupMinAmount",
            "type": "u64"
          },
          {
            "name": "lockupMaxSaturation",
            "type": "u64"
          },
          {
            "name": "proposalMinVotingPowerForQuorum",
            "type": "u64"
          },
          {
            "name": "proposalMinPassPct",
            "type": "u16"
          },
          {
            "name": "proposalCanUpdateAfterVotes",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "UpdateProposalArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "VoteArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "choice",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6001,
      "name": "InvalidTokenMint",
      "msg": "Invalid Token Mint"
    },
    {
      "code": 6002,
      "name": "InvalidTokenAmount",
      "msg": "Invalid Token Amount"
    },
    {
      "code": 6003,
      "name": "InvalidTokenDelegate",
      "msg": "Invalid Timestamp"
    },
    {
      "code": 6004,
      "name": "InvalidTimestamp",
      "msg": "Invalid Token Delegate"
    },
    {
      "code": 6005,
      "name": "InvalidLockupAmount",
      "msg": "Invalid Lockup Amount"
    },
    {
      "code": 6006,
      "name": "InvalidVotingPower",
      "msg": "Invalid Voting Power"
    },
    {
      "code": 6007,
      "name": "InvalidPayer",
      "msg": "Invalid Payer"
    },
    {
      "code": 6008,
      "name": "InvalidProposalState",
      "msg": "Invalid Proposal State"
    },
    {
      "code": 6009,
      "name": "Overflow",
      "msg": "Overflow"
    },
    {
      "code": 6010,
      "name": "CannotUpdateProposal",
      "msg": "Cannot Update Proposal"
    },
    {
      "code": 6011,
      "name": "InvalidURI",
      "msg": "Invalid URI"
    },
    {
      "code": 6012,
      "name": "InvalidNamespace",
      "msg": "Invalid Namespace"
    },
    {
      "code": 6013,
      "name": "InvalidLockup",
      "msg": "Invalid Lockup"
    },
    {
      "code": 6014,
      "name": "InvalidVoteRecord",
      "msg": "Invalid Vote Record"
    }
  ]
};

export const IDL: Vetoken = {
  "version": "0.1.0",
  "name": "vetoken",
  "instructions": [
    {
      "name": "initNamespace",
      "accounts": [
        {
          "name": "deployer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "securityCouncil",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reviewCouncil",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateNamespace",
      "accounts": [
        {
          "name": "securityCouncil",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateNamespaceArgs"
          }
        }
      ]
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockup",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockupTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "StakeArgs"
          }
        }
      ]
    },
    {
      "name": "stakeTo",
      "accounts": [
        {
          "name": "securityCouncil",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockup",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockupTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "StakeToArgs"
          }
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockup",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockupTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initProposal",
      "accounts": [
        {
          "name": "reviewCouncil",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitProposalArgs"
          }
        }
      ]
    },
    {
      "name": "updateProposal",
      "accounts": [
        {
          "name": "reviewCouncil",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateProposalArgs"
          }
        }
      ]
    },
    {
      "name": "vote",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lockup",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voteRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "VoteArgs"
          }
        }
      ]
    },
    {
      "name": "initDistribution",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "uuid",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distributionTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "InitDistributionArgs"
          }
        }
      ]
    },
    {
      "name": "updateDistribution",
      "accounts": [
        {
          "name": "securityCouncil",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "distribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateDistributionArgs"
          }
        }
      ]
    },
    {
      "name": "claimFromDistribution",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "claimant",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cosigner1",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "cosigner2",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "distributionClaim",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "distribution",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Use multiple token accounts to shard the writes"
          ]
        },
        {
          "name": "claimantTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "ClaimFromDistributionArgs"
          }
        }
      ]
    },
    {
      "name": "withdrawFromDistribution",
      "accounts": [
        {
          "name": "securityCouncil",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "distribution",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "distributionTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "securityCouncilTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ns",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "namespace",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "deployer",
            "type": "publicKey"
          },
          {
            "name": "securityCouncil",
            "type": "publicKey"
          },
          {
            "name": "reviewCouncil",
            "type": "publicKey"
          },
          {
            "name": "overrideNow",
            "type": "i64"
          },
          {
            "name": "lockupDefaultTargetRewardsPct",
            "type": "u16"
          },
          {
            "name": "lockupDefaultTargetVotingPct",
            "type": "u16"
          },
          {
            "name": "lockupMinDuration",
            "type": "i64"
          },
          {
            "name": "lockupMinAmount",
            "type": "u64"
          },
          {
            "name": "lockupMaxSaturation",
            "type": "u64"
          },
          {
            "name": "proposalMinVotingPowerForQuorum",
            "type": "u64"
          },
          {
            "name": "proposalMinPassPct",
            "type": "u16"
          },
          {
            "name": "proposalCanUpdateAfterVotes",
            "type": "bool"
          },
          {
            "name": "lockupAmount",
            "type": "u64"
          },
          {
            "name": "proposalNonce",
            "type": "u32"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "lockup",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ns",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "targetRewardsPct",
            "type": "u16"
          },
          {
            "name": "targetVotingPct",
            "type": "u16"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ns",
            "type": "publicKey"
          },
          {
            "name": "nonce",
            "type": "u32"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "votingPowerChoices",
            "type": {
              "array": [
                "u64",
                6
              ]
            }
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ns",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "proposal",
            "type": "publicKey"
          },
          {
            "name": "lockup",
            "type": "publicKey"
          },
          {
            "name": "choice",
            "type": "u8"
          },
          {
            "name": "votingPower",
            "type": "u64"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "distribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ns",
            "type": "publicKey"
          },
          {
            "name": "uuid",
            "type": "publicKey"
          },
          {
            "name": "cosigner1",
            "type": "publicKey"
          },
          {
            "name": "cosigner2",
            "type": "publicKey"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "distributionTokenMint",
            "type": "publicKey"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "distributionClaim",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ns",
            "type": "publicKey"
          },
          {
            "name": "distribution",
            "type": "publicKey"
          },
          {
            "name": "claimant",
            "type": "publicKey"
          },
          {
            "name": "distributionTokenMint",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "cosignedMsg",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                240
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ClaimFromDistributionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "cosignedMsg",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "InitDistributionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cosigner1",
            "type": "publicKey"
          },
          {
            "name": "cosigner2",
            "type": "publicKey"
          },
          {
            "name": "startTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "InitProposalArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "StakeToArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "disableRewards",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "StakeArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "endTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "UpdateDistributionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "UpdateNamespaceArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "securityCouncil",
            "type": "publicKey"
          },
          {
            "name": "reviewCouncil",
            "type": "publicKey"
          },
          {
            "name": "lockupDefaultTargetRewardsPct",
            "type": "u16"
          },
          {
            "name": "lockupDefaultTargetVotingPct",
            "type": "u16"
          },
          {
            "name": "lockupMinDuration",
            "type": "i64"
          },
          {
            "name": "lockupMinAmount",
            "type": "u64"
          },
          {
            "name": "lockupMaxSaturation",
            "type": "u64"
          },
          {
            "name": "proposalMinVotingPowerForQuorum",
            "type": "u64"
          },
          {
            "name": "proposalMinPassPct",
            "type": "u16"
          },
          {
            "name": "proposalCanUpdateAfterVotes",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "UpdateProposalArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "VoteArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "choice",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidOwner",
      "msg": "Invalid Owner"
    },
    {
      "code": 6001,
      "name": "InvalidTokenMint",
      "msg": "Invalid Token Mint"
    },
    {
      "code": 6002,
      "name": "InvalidTokenAmount",
      "msg": "Invalid Token Amount"
    },
    {
      "code": 6003,
      "name": "InvalidTokenDelegate",
      "msg": "Invalid Timestamp"
    },
    {
      "code": 6004,
      "name": "InvalidTimestamp",
      "msg": "Invalid Token Delegate"
    },
    {
      "code": 6005,
      "name": "InvalidLockupAmount",
      "msg": "Invalid Lockup Amount"
    },
    {
      "code": 6006,
      "name": "InvalidVotingPower",
      "msg": "Invalid Voting Power"
    },
    {
      "code": 6007,
      "name": "InvalidPayer",
      "msg": "Invalid Payer"
    },
    {
      "code": 6008,
      "name": "InvalidProposalState",
      "msg": "Invalid Proposal State"
    },
    {
      "code": 6009,
      "name": "Overflow",
      "msg": "Overflow"
    },
    {
      "code": 6010,
      "name": "CannotUpdateProposal",
      "msg": "Cannot Update Proposal"
    },
    {
      "code": 6011,
      "name": "InvalidURI",
      "msg": "Invalid URI"
    },
    {
      "code": 6012,
      "name": "InvalidNamespace",
      "msg": "Invalid Namespace"
    },
    {
      "code": 6013,
      "name": "InvalidLockup",
      "msg": "Invalid Lockup"
    },
    {
      "code": 6014,
      "name": "InvalidVoteRecord",
      "msg": "Invalid Vote Record"
    }
  ]
};
