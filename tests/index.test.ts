import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  unpackAccount,
  Account,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  AccountInfo,
  Connection,
} from "@solana/web3.js";
import { Clock, ProgramTestContext, startAnchor } from "solana-bankrun";
import { assert, describe, expect, test } from "vitest";
import { VeTokenSDK, Global, Lockup, VoteRecord } from "../src";
import fs from "fs";
import BN from "bn.js";

const TOKEN_MINT = new PublicKey(
  "8SMdDN9nZg2ntiBYieVKx7zeXL3DPPvFSTqV4KpsZAMH"
);

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
    address: signers.securityCouncil.publicKey,
    info: (await conn.getAccountInfo(signers.securityCouncil.publicKey))!,
  });
  _cloneAccounts.push({
    address: TOKEN_MINT,
    info: (await conn.getAccountInfo(TOKEN_MINT))!,
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

async function setupGlobal() {
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
    TOKEN_MINT,
    TOKEN_PROGRAM_ID
  );

  const globalPDA = sdk.pdaGlobal();
  const globalAcct = await ctx.banksClient.getAccount(globalPDA);
  if (globalAcct) {
    return globalPDA;
  }

  const tx = sdk.txInitGlobal();
  tx.recentBlockhash = ctx.lastBlockhash;
  tx.sign(ctx.payer, signers.deployer);
  await ctx.banksClient.processTransaction(tx);
  return globalPDA;
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
  const vr = await ctx.banksClient.getAccount(sdk.pdaVoteRecord(owner, proposal));
  if (!vr) {
    return null;
  }
  return VoteRecord.decode(Buffer.from(vr.data));
}

function useSigners(): { [key: string]: Keypair } {
  let paths = {
    deployer:
      "./tests/test-keys/tstCcqtDJtqnNDjqqg3UdZfUyrUmzfZ1wo1vpmXbM2S.json",
    securityCouncil:
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

describe("global", async () => {
  test("init global", async () => {
    const ctx = await setupCtx();
    const globalPDA = await setupGlobal();
    const globalBytes = await ctx.banksClient.getAccount(globalPDA);
    assert(globalPDA);
    assert(globalBytes);

    const global = Global.decode(Buffer.from(globalBytes.data));
    assert(global.lockupAmount.eqn(0));
    assert(global.debugTsOffset.eqn(0));
    assert(global.proposalNonce === 0);
    assert(
      global.securityCouncil.equals(useSigners().securityCouncil.publicKey)
    );
  });
});

describe("stake", async () => {
  describe("stake happy path", async () => {
    const ctx = await setupCtx();
    const signers = useSigners();

    const sdk = new VeTokenSDK(
      signers.deployer.publicKey,
      signers.securityCouncil.publicKey,
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
      const confirmed = await ctx.banksClient.processTransaction(tx);
      assert(confirmed);
      const lockup = await getLockup(ctx, sdk, signers.user1.publicKey);
      assert(lockup);
      assert(lockup.amount.eq(new BN(400 * 1e6)));
      assert(lockup.endTs.eq(endTs));
      assert(lockup.owner.equals(signers.user1.publicKey));
      assert(!lockup.startTs.eqn(0));
    });

    test("stake second time for user1", async () => {
      const tx = sdk.txStake(signers.user1.publicKey, new BN(300 * 1e6), endTs);
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user1);
      const confirmed = await ctx.banksClient.processTransaction(tx);
      assert(confirmed);
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
      assert(await ctx.banksClient.processTransaction(tx));
      ctx.setClock(currentClock);
    });

    test("stake first time for user2", async () => {
      const tx = sdk.txStake(signers.user2.publicKey, new BN(400 * 1e6), endTs);
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      const confirmed = await ctx.banksClient.processTransaction(tx);
      assert(confirmed);
      const lockup = await getLockup(ctx, sdk, signers.user2.publicKey);
      assert(lockup);
      assert(lockup.amount.eq(new BN(400 * 1e6)));
      assert(lockup.endTs.eq(endTs));
      assert(lockup.owner.equals(signers.user2.publicKey));
      assert(!lockup.startTs.eqn(0));
    });

    test("unstake should fail because the timestamp was not there yet for user2", async () => {
      const tx = sdk.txUnstake(signers.user2.publicKey);
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      expect(ctx.banksClient.processTransaction(tx)).rejects.toThrow("0x1773");
    });
  });
});

describe("proposal", async () => {
  const ctx = await setupCtx();
  const signers = useSigners();

  const sdk = new VeTokenSDK(
    signers.deployer.publicKey,
    signers.securityCouncil.publicKey,
    TOKEN_MINT,
    TOKEN_PROGRAM_ID
  );

  const startTs = new BN(new Date().getTime() / 1000 - 1000);
  const endTs = new BN(
    (new Date().getTime() + 1000 * 60 * 60 * 24 * 30) / 1000
  );
  describe("proposal happy path", async () => {
    test("create proposal with nonce 0 and staked user2", async () => {
      const tx = sdk.txInitProposal(
        signers.user2.publicKey,
        0, // nonce 0
        "https://example.com/0",
        startTs,
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      const confirmed = await ctx.banksClient.processTransaction(tx);
      assert(confirmed);
    });

    test("create proposal with nonce 1 and staked user2", async () => {
      const tx = sdk.txInitProposal(
        signers.user2.publicKey,
        1, // nonce 0
        "https://example.com/1",
        startTs,
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      const confirmed = await ctx.banksClient.processTransaction(tx);
      assert(confirmed);
    });

    test("create proposal with nonce 0 and staked user2 should failed because it's already created", async () => {
      const tx = sdk.txInitProposal(
        signers.user2.publicKey,
        0, // nonce 0
        "https://example.com/00",
        startTs,
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      expect(ctx.banksClient.processTransaction(tx)).rejects.toThrow("0x7d6");
    });

    test("create proposal from unstaked user1 will fail", async () => {
      const tx = sdk.txInitProposal(
        signers.user1.publicKey,
        1,
        "https://example.com/1",
        startTs,
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user1);
      expect(ctx.banksClient.processTransaction(tx)).rejects.toThrow("0xbc4");
    });

    test("update proposal from the staked user2 who created the proposal before voting", async () => {
      const tx = sdk.txUpdateProposal(
        signers.user2.publicKey,
        sdk.pdaProposal(0), // nonce 0
        "https://example.com/0",
        startTs,
        endTs
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      const confirmed = await ctx.banksClient.processTransaction(tx);
      assert(confirmed);
    });
  });


  describe("proposal with voting", async () => {
    test("vote by user2", async () => {
      const tx = sdk.txVote(
        signers.user2.publicKey,
        sdk.pdaProposal(0),
        0, // choice 0
      );
      tx.recentBlockhash = ctx.lastBlockhash;
      tx.sign(ctx.payer, signers.user2);
      const confirmed = await ctx.banksClient.processTransaction(tx);
      assert(confirmed);
      const vr = await getVoteRecord(ctx, sdk, signers.user2.publicKey, sdk.pdaProposal(0));
      assert(vr);
      expect(vr.choice).toBe(0);
      expect(vr.votingPower.toNumber()).toBe(800000000); // TODO: this needs to be checked from the ts's voting power calculation
    });
  });
});
