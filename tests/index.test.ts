import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  unpackAccount,
  Account,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  createApproveCheckedInstruction,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  AccountInfo,
  Connection,
  Signer,
} from "@solana/web3.js";
import { Clock, ProgramTestContext, startAnchor } from "solana-bankrun";
import { assert, describe, expect, test } from "vitest";
import {
  VeTokenSDK,
  Namespace,
  Lockup,
  VoteRecord,
  Distribution,
  DistributionClaim,
} from "../src";
import fs from "fs";
import BN from "bn.js";

const TOKEN_MINT = new PublicKey(
  "8SMdDN9nZg2ntiBYieVKx7zeXL3DPPvFSTqV4KpsZAMH"
);
const TOKEN_DECIMALS = 6;

let _cloneAccounts:
  | { address: PublicKey; info: AccountInfo<Buffer> }[]
  | undefined;
async function setupCloneAccounts() {
  const conn = new Connection("https://api.devnet.solana.com");
  if (_cloneAccounts !== undefined) {
    return _cloneAccounts;
  }
  const signers = useSigners();

  _cloneAccounts = [];
  _cloneAccounts.push({
    address: signers.deployer.publicKey,
    info: (await conn.getAccountInfo(signers.deployer.publicKey))!,
  });
  _cloneAccounts.push({
    address: TOKEN_MINT,
    info: (await conn.getAccountInfo(TOKEN_MINT))!,
  });
  _cloneAccounts.push({
    address: signers.securityCouncil.publicKey,
    info: (await conn.getAccountInfo(signers.securityCouncil.publicKey))!,
  });
  _cloneAccounts.push({
    address: getAssociatedTokenAddressSync(
      TOKEN_MINT,
      signers.securityCouncil.publicKey,
      true
    ),
    info: (await conn.getAccountInfo(
      getAssociatedTokenAddressSync(
        TOKEN_MINT,
        signers.securityCouncil.publicKey,
        true
      )
    ))!,
  });
  _cloneAccounts.push({
    address: signers.user1.publicKey,
    info: (await conn.getAccountInfo(signers.user1.publicKey))!,
  });
  _cloneAccounts.push({
    address: getAssociatedTokenAddressSync(
      TOKEN_MINT,
      signers.user1.publicKey,
      true
    ),
    info: (await conn.getAccountInfo(
      getAssociatedTokenAddressSync(TOKEN_MINT, signers.user1.publicKey, true)
    ))!,
  });
  _cloneAccounts.push({
    address: signers.user2.publicKey,
    info: (await conn.getAccountInfo(signers.user2.publicKey))!,
  });
  _cloneAccounts.push({
    address: getAssociatedTokenAddressSync(
      TOKEN_MINT,
      signers.user2.publicKey,
      true
    ),
    info: (await conn.getAccountInfo(
      getAssociatedTokenAddressSync(TOKEN_MINT, signers.user2.publicKey, true)
    ))!,
  });
  return _cloneAccounts;
}

let _ctx: ProgramTestContext | undefined;
async function setupCtx() {
  if (_ctx) {
    return _ctx;
  }
  const extraAccounts = await setupCloneAccounts();
  _ctx = await startAnchor("", [], extraAccounts);
  return _ctx;
}

async function setupNamespace() {
  const ctx = await setupCtx();
  const signers = useSigners();
  await airdrop(ctx, signers.deployer.publicKey, 10 * LAMPORTS_PER_SOL);

  const deployerBalance = await ctx.banksClient.getBalance(
    signers.deployer.publicKey
  );
  assert(
    deployerBalance >= 10 * LAMPORTS_PER_SOL,
    "deployer balance is less than 10 SOL"
  );

  const sdk = new VeTokenSDK(
    signers.deployer.publicKey,
    signers.securityCouncil.publicKey,
    signers.reviewCouncil.publicKey,
    TOKEN_MINT,
    TOKEN_PROGRAM_ID
  );

  const nsPDA = sdk.pdaNamespace();
  const nsAcct = await ctx.banksClient.getAccount(nsPDA);
  if (nsAcct) {
    return nsPDA;
  }

  const tx = sdk.txInitNamespace();
  tx.recentBlockhash = ctx.lastBlockhash;
  tx.sign(ctx.payer, signers.deployer);
  await ctx.banksClient.tryProcessTransaction(tx);
  return nsPDA;
}

async function getToken(
  ctx: ProgramTestContext,
  address: PublicKey
): Promise<Account | null> {
  const tokenAccount = await ctx.banksClient.getAccount(address);
  if (!tokenAccount) {
    return null;
  }
  const tokenBuffer = {
    ...tokenAccount,
    data: Buffer.from(tokenAccount.data),
  };
  const token = unpackAccount(address, tokenBuffer);
  return token;
}

async function getLockup(
  ctx: ProgramTestContext,
  sdk: VeTokenSDK,
  owner: PublicKey
): Promise<Lockup | null> {
  const lockupAcct = await ctx.banksClient.getAccount(sdk.pdaLockup(owner));
  if (!lockupAcct) {
    return null;
  }
  return Lockup.decode(Buffer.from(lockupAcct.data));
}

async function getVoteRecord(
  ctx: ProgramTestContext,
  sdk: VeTokenSDK,
  owner: PublicKey,
  proposal: PublicKey
): Promise<VoteRecord | null> {
  const vr = await ctx.banksClient.getAccount(
    sdk.pdaVoteRecord(owner, proposal)
  );
  if (!vr) {
    return null;
  }
  return VoteRecord.decode(Buffer.from(vr.data));
}

async function getDistribution(
  ctx: ProgramTestContext,
  sdk: VeTokenSDK,
  distribution: PublicKey
): Promise<Distribution | null> {
  const d = await ctx.banksClient.getAccount(distribution);
  if (!d) {
    return null;
  }
  return Distribution.decode(Buffer.from(d.data));
}

async function getDistributionClaim(
  ctx: ProgramTestContext,
  sdk: VeTokenSDK,
  distributionClaim: PublicKey
): Promise<DistributionClaim | null> {
  const dc = await ctx.banksClient.getAccount(distributionClaim);
  if (!dc) {
    return null;
  }
  return DistributionClaim.decode(Buffer.from(dc.data));
}

function useSigners(): { [key: string]: Keypair } {
  let paths = {
    deployer:
      "./tests/test-keys/tstCcqtDJtqnNDjqqg3UdZfUyrUmzfZ1wo1vpmXbM2S.json",
    securityCouncil:
      "./tests/test-keys/tstpKQMFhqMPsvJPu4wQdu1ZRA4a2H8EJD5TXc9KpBq.json",
    reviewCouncil:
      "./tests/test-keys/tstpKQMFhqMPsvJPu4wQdu1ZRA4a2H8EJD5TXc9KpBq.json",
    user1: "./tests/test-keys/tstRBjm2iwuCPSsU4DqGGG75N9rj4LDxxkGg9FTuDFn.json",
    user2: "./tests/test-keys/tstxJsqAgEZUwHHfgq4MdLVD715jDPqYjBAZiSD5cRz.json",
  };

  const ret = {};
  for (const key in paths) {
    ret[key] = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(fs.readFileSync(paths[key], "utf-8")))
    );
  }
  return ret;
}

async function airdrop(
  ctx: ProgramTestContext,
  receiver: PublicKey,
  lamports: number
) {
  const client = ctx.banksClient;
  const payer = ctx.payer;
  const blockhash = ctx.lastBlockhash;
  const ixs = [
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: receiver,
      lamports,
    }),
  ];
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  tx.sign(payer);
  await client.processTransaction(tx);
}

async function transferToken(
  ctx: ProgramTestContext,
  mint: PublicKey,
  sourceOwner: Signer,
  destOwner: PublicKey,
  amount: number
) {
  const client = ctx.banksClient;
  const payer = ctx.payer;
  const blockhash = ctx.lastBlockhash;
  const ixs = [
    createAssociatedTokenAccountIdempotentInstruction(
      sourceOwner.publicKey,
      getAssociatedTokenAddressSync(mint, destOwner, true),
      destOwner,
      mint
    ),
    createTransferCheckedInstruction(
      getAssociatedTokenAddressSync(mint, sourceOwner.publicKey, true),
      mint,
      getAssociatedTokenAddressSync(mint, destOwner, true),
      sourceOwner.publicKey,
      amount,
      TOKEN_DECIMALS
    ),
  ];
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  tx.sign(payer, sourceOwner);
  await client.processTransaction(tx);
}

async function approveToken(
  ctx: ProgramTestContext,
  mint: PublicKey,
  sourceOwner: Signer,
  delegate: PublicKey,
  amount: number,
) {
  const client = ctx.banksClient;
  const payer = ctx.payer;
  const blockhash = ctx.lastBlockhash;
  const ixs = [
    createApproveCheckedInstruction(
      getAssociatedTokenAddressSync(mint, sourceOwner.publicKey, true),
      mint,
      delegate,
      sourceOwner.publicKey,
      amount,
      TOKEN_DECIMALS
    ),
  ];
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  tx.sign(payer, sourceOwner);
  await client.processTransaction(tx);
}

test("token balance", async () => {
  const ctx = await setupCtx();
  const signers = useSigners();
  const [user1TokenAcct, user2TokenAcct] = await Promise.all([
    getToken(
      ctx,
      getAssociatedTokenAddressSync(TOKEN_MINT, signers.user1.publicKey, true)
    ),
    getToken(
      ctx,
      getAssociatedTokenAddressSync(TOKEN_MINT, signers.user2.publicKey, true)
    ),
  ]);
  assert(user1TokenAcct);
  expect(user1TokenAcct.amount).toBe(BigInt(50000 * 1e6));
  assert(user2TokenAcct);
  expect(user2TokenAcct.amount).toBe(BigInt(30000 * 1e6));
});

describe("ns", async () => {
  test("init namespace", async () => {
    const ctx = await setupCtx();
    const nsPDA = await setupNamespace();
    const nsBytes = await ctx.banksClient.getAccount(nsPDA);
    assert(nsPDA);
    assert(nsBytes);

    const ns = Namespace.decode(Buffer.from(nsBytes.data));
    assert(ns.lockupAmount.eqn(0));
    assert(ns.overrideNow.eqn(0));
    assert(ns.proposalNonce === 0);
    assert(ns.securityCouncil.equals(useSigners().securityCouncil.publicKey));
  });
});

describe("stake", async () => {
  describe("stake happy path", async () => {
    const ctx = await setupCtx();
    const signers = useSigners();

    const sdk = new VeTokenSDK(
      signers.deployer.publicKey,
      signers.securityCouncil.publicKey,
      signers.reviewCouncil.publicKey,
      TOKEN_MINT,
      TOKEN_PROGRAM_ID
    );

    const endTs = new BN(
      (new Date().getTime() + 1000 * 60 * 60 * 24 * 30) / 1000
    );

    test("stake first time for user1", async () => {
      const tx = sdk.txStake(signers.user1.publicKey, new BN(400 * 1e6), endTs);
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user1);
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      assert(confirmed.result === null);
      const lockup = await getLockup(ctx, sdk, signers.user1.publicKey);
      assert(lockup);
      assert(lockup.amount.eq(new BN(400 * 1e6)));
      assert(lockup.endTs.eq(endTs));
      assert(lockup.targetRewardsBp !== 0);
      assert(lockup.owner.equals(signers.user1.publicKey));
      assert(!lockup.startTs.eqn(0));
    });

    test("stake second time for user1", async () => {
      const tx = sdk.txStake(signers.user1.publicKey, new BN(300 * 1e6), endTs);
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user1);
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      assert(confirmed.result === null);
      const lockup = await getLockup(ctx, sdk, signers.user1.publicKey);
      assert(lockup);
      assert(lockup.amount.eq(new BN(700 * 1e6)));
      assert(lockup.endTs.eq(endTs));
      assert(lockup.owner.equals(signers.user1.publicKey));
      assert(!lockup.startTs.eqn(0));
    });

    test("unstake can be good for user1", async () => {
      const currentClock = await ctx.banksClient.getClock();
      ctx.setClock(
        new Clock(
          currentClock.slot,
          currentClock.epochStartTimestamp,
          currentClock.epoch,
          currentClock.leaderScheduleEpoch,
          currentClock.unixTimestamp + 2678400n
        )
      );

      const tx = sdk.txUnstake(signers.user1.publicKey);
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user1);
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      assert(confirmed.result === null);
      const lockup = await getLockup(ctx, sdk, signers.user1.publicKey);
      assert(lockup === null);
      ctx.setClock(currentClock);
    });

    test("stakeTo first time for user2 by security council", async () => {
      const tx = sdk.txStakeTo(
        signers.user2.publicKey,
        new BN(400 * 1e6),
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.securityCouncil); // only security council can stakeTo
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      assert(confirmed.result === null);
      const lockup = await getLockup(ctx, sdk, signers.user2.publicKey);
      assert(lockup);
      assert(lockup.amount.eq(new BN(400 * 1e6)));
      assert(lockup.endTs.eq(endTs));
      assert(lockup.owner.equals(signers.user2.publicKey));
      assert(lockup.targetRewardsBp === 0);
      assert(!lockup.startTs.eqn(0));
    });

    test("unstake should fail because the timestamp was not there yet for user2", async () => {
      const tx = sdk.txUnstake(signers.user2.publicKey);
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      expect(confirmed.result).contains("0x1774");
    });
  });
});

describe("proposal", async () => {
  const ctx = await setupCtx();
  const signers = useSigners();

  const sdk = new VeTokenSDK(
    signers.deployer.publicKey,
    signers.securityCouncil.publicKey,
    signers.reviewCouncil.publicKey,
    TOKEN_MINT,
    TOKEN_PROGRAM_ID
  );

  const startTs = new BN(new Date().getTime() / 1000 - 1000);
  const endTs = new BN(
    (new Date().getTime() + 1000 * 60 * 60 * 24 * 3) / 1000 // 3 days of proposal duration
  );
  describe("proposal happy path", async () => {
    test("create proposal with nonce 0 by review council", async () => {
      const tx = sdk.txInitProposal(
        signers.reviewCouncil.publicKey,
        0, // nonce 0
        "https://example.com/0",
        startTs,
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.reviewCouncil);
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      assert(confirmed.result === null);
    });

    test("create proposal with nonce 1 by review council", async () => {
      const tx = sdk.txInitProposal(
        signers.reviewCouncil.publicKey,
        1, // nonce 1
        "https://example.com/1",
        startTs,
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.reviewCouncil);
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      assert(confirmed.result === null);
    });

    test("update proposal from the reviewCouncil should be fine", async () => {
      const tx = sdk.txUpdateProposal(
        signers.reviewCouncil.publicKey,
        sdk.pdaProposal(0), // nonce 0
        "https://example.com/new_url/0",
        startTs,
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.reviewCouncil);
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      assert(confirmed.result === null);
    });

    test("create proposal with nonce 2 with user 2 should failed because user 1 is not review council", async () => {
      const tx = sdk.txInitProposal(
        signers.user2.publicKey,
        2, // nonce 2
        "https://example.com/00",
        startTs,
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      expect(confirmed.result).contains("0x7d1");
    });

    test("update proposal from user2 should fail because user 2 is not review council", async () => {
      const tx = sdk.txUpdateProposal(
        signers.user2.publicKey,
        sdk.pdaProposal(0), // nonce 0
        "https://example.com/0",
        startTs,
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      expect(confirmed.result).contains("0x7d1");
    });
  });

  describe("proposal with voting", async () => {
    test("vote by user2", async () => {
      const tx = sdk.txVote(
        signers.user2.publicKey,
        sdk.pdaProposal(0),
        0 // choice 0
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
      console.log(confirmed.meta?.logMessages);
      assert(confirmed.result === null);
      const vr = await getVoteRecord(
        ctx,
        sdk,
        signers.user2.publicKey,
        sdk.pdaProposal(0)
      );
      assert(vr);
      expect(vr.choice).toBe(0);
      expect(vr.votingPower.toNumber()).toBe(8219178); // TODO: this needs to be checked from the ts's voting power calculation
    });
  });
});

describe("proposal", async () => {
  const ctx = await setupCtx();
  const signers = useSigners();

  const sdk = new VeTokenSDK(
    signers.deployer.publicKey,
    signers.securityCouncil.publicKey,
    signers.reviewCouncil.publicKey,
    TOKEN_MINT,
    TOKEN_PROGRAM_ID
  );

  const startTs = new BN(new Date().getTime() / 1000 - 1000);
  const cosigner1 = Keypair.generate();
  const cosigner2 = Keypair.generate();

  test("init distribution uuid1", async () => {
    const uuid1 = Keypair.generate();
    const tx = sdk.txInitDistribution(
      ctx.payer.publicKey,
      uuid1.publicKey,
      cosigner1.publicKey,
      cosigner2.publicKey,
      startTs
    );
    tx.recentBlockhash = ctx.lastBlockhash;
    tx.sign(ctx.payer, uuid1);
    const confirmed = await ctx.banksClient.tryProcessTransaction(tx);
    assert(confirmed.result === null);
    const d = await getDistribution(ctx, sdk, sdk.pdaDistribution(cosigner1.publicKey, cosigner2.publicKey, uuid1.publicKey));
    assert(d);
    assert(d.cosigner1.equals(cosigner1.publicKey));
    assert(d.cosigner2.equals(cosigner2.publicKey));
    assert(d.distributionTokenMint.equals(TOKEN_MINT));
    assert(d.startTs.eq(startTs));
  });

  test("init distribution uuid2", async () => {
    const uuid2 = Keypair.generate();
    let tx = sdk.txInitDistribution(
      ctx.payer.publicKey,
      uuid2.publicKey,
      cosigner1.publicKey,
      cosigner2.publicKey,
      startTs
    );
    tx.recentBlockhash = ctx.lastBlockhash;
    tx.sign(ctx.payer, uuid2);
    let confirmed = await ctx.banksClient.tryProcessTransaction(tx);
    assert(confirmed.result === null);
    const d = await getDistribution(ctx, sdk, sdk.pdaDistribution(cosigner1.publicKey, cosigner2.publicKey, uuid2.publicKey));
    assert(d);
    assert(d.cosigner1.equals(cosigner1.publicKey));
    assert(d.cosigner2.equals(cosigner2.publicKey));
    assert(d.distributionTokenMint.equals(TOKEN_MINT));
    assert(d.startTs.eq(startTs));


    const claimant = Keypair.generate();
    const vaultOwner1 = Keypair.generate();
    const approvedAmount = 33_000_000;
    const claimAmount = 33_000_000;
    const cosignedMsg = "cosigned message by cosigner1 and cosigner2";
    const distribution = sdk.pdaDistribution(cosigner1.publicKey, cosigner2.publicKey, uuid2.publicKey);

    await transferToken(ctx, TOKEN_MINT, signers.securityCouncil, vaultOwner1.publicKey, approvedAmount);
    await approveToken(ctx, TOKEN_MINT, vaultOwner1, distribution, approvedAmount);

    tx = sdk.txClaimFromDistribution(
      ctx.payer.publicKey,
      distribution,
      getAssociatedTokenAddressSync(TOKEN_MINT, vaultOwner1.publicKey, true),
      cosigner1.publicKey,
      cosigner2.publicKey,
      claimant.publicKey,
      new BN(claimAmount),
      cosignedMsg,
    );
    tx.recentBlockhash = ctx.lastBlockhash;
    tx.sign(ctx.payer, cosigner1, cosigner2);
    confirmed = await ctx.banksClient.tryProcessTransaction(tx);
    assert(confirmed.result === null);
    const dc = await getDistributionClaim(ctx, sdk, sdk.pdaDistributionClaim(claimant.publicKey, cosignedMsg));
    assert(dc);
    assert(dc.claimant.equals(claimant.publicKey));
    const claimantTokenAccount = await getToken(ctx, getAssociatedTokenAddressSync(TOKEN_MINT, claimant.publicKey, true));
    assert(claimantTokenAccount);
    assert(claimantTokenAccount.amount === BigInt(claimAmount));
  });
});
