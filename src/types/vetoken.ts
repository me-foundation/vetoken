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
          "name": "payer",
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
            "name": "lockupAmount",
            "type": "u64"
          },
          {
            "name": "proposalNonce",
            "type": "u32"
          },
          {
            "name": "debugTsOffset",
            "type": "i64"
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
            "name": "targetRewardsBp",
            "type": "u16"
          },
          {
            "name": "targetVotingBp",
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
            "name": "uri",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
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
            "name": "numChoice0",
            "type": "u64"
          },
          {
            "name": "numChoice1",
            "type": "u64"
          },
          {
            "name": "numChoice2",
            "type": "u64"
          },
          {
            "name": "numChoice3",
            "type": "u64"
          },
          {
            "name": "numChoice4",
            "type": "u64"
          },
          {
            "name": "numChoice5",
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
    }
  ],
  "types": [
    {
      "name": "InitProposalArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
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
            "name": "disableRewardsBp",
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
      "name": "UpdateNamespaceArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newSecurityCouncil",
            "type": "publicKey"
          },
          {
            "name": "debugTsOffset",
            "type": {
              "option": "i64"
            }
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
            "name": "uri",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
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
      "name": "InvalidTimestamp",
      "msg": "Invalid Timestamp"
    },
    {
      "code": 6004,
      "name": "InvalidLockupAmount",
      "msg": "Invalid Lockup Amount"
    },
    {
      "code": 6005,
      "name": "InvalidVotingPower",
      "msg": "Invalid Voting Power"
    },
    {
      "code": 6006,
      "name": "InvalidPayer",
      "msg": "Invalid Payer"
    },
    {
      "code": 6007,
      "name": "InvalidProposalState",
      "msg": "Invalid Proposal State"
    },
    {
      "code": 6008,
      "name": "Overflow",
      "msg": "Overflow"
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
          "name": "payer",
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
            "name": "lockupAmount",
            "type": "u64"
          },
          {
            "name": "proposalNonce",
            "type": "u32"
          },
          {
            "name": "debugTsOffset",
            "type": "i64"
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
            "name": "targetRewardsBp",
            "type": "u16"
          },
          {
            "name": "targetVotingBp",
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
            "name": "uri",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
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
            "name": "numChoice0",
            "type": "u64"
          },
          {
            "name": "numChoice1",
            "type": "u64"
          },
          {
            "name": "numChoice2",
            "type": "u64"
          },
          {
            "name": "numChoice3",
            "type": "u64"
          },
          {
            "name": "numChoice4",
            "type": "u64"
          },
          {
            "name": "numChoice5",
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
    }
  ],
  "types": [
    {
      "name": "InitProposalArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uri",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
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
            "name": "disableRewardsBp",
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
      "name": "UpdateNamespaceArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newSecurityCouncil",
            "type": "publicKey"
          },
          {
            "name": "debugTsOffset",
            "type": {
              "option": "i64"
            }
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
            "name": "uri",
            "type": {
              "array": [
                "u8",
                256
              ]
            }
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
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
      "name": "InvalidTimestamp",
      "msg": "Invalid Timestamp"
    },
    {
      "code": 6004,
      "name": "InvalidLockupAmount",
      "msg": "Invalid Lockup Amount"
    },
    {
      "code": 6005,
      "name": "InvalidVotingPower",
      "msg": "Invalid Voting Power"
    },
    {
      "code": 6006,
      "name": "InvalidPayer",
      "msg": "Invalid Payer"
    },
    {
      "code": 6007,
      "name": "InvalidProposalState",
      "msg": "Invalid Proposal State"
    },
    {
      "code": 6008,
      "name": "Overflow",
      "msg": "Overflow"
    }
  ]
};
