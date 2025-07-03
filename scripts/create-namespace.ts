import * as dotenv from "dotenv";
dotenv.config();

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { VeTokenSDK } from "../src";
import bs58 from "bs58";
import chalk from "chalk";

const CONFIG = {
  endpoint: process.env.SOLANA_RPC_ENDPOINT!,
  deployerKeypair: process.env.DEPLOYER_KEYPAIR!,
  securityCouncil: process.env.SECURITY_COUNCIL_ADDRESS!,
  reviewCouncil: process.env.REVIEW_COUNCIL_ADDRESS!,
  tokenMint: process.env.TOKEN_MINT_ADDRESS!,
  lockupDefaultTargetRewardsPct: Number(
    process.env.LOCKUP_DEFAULT_TARGET_REWARDS_PCT || 100
  ),
  lockupDefaultTargetVotingPct: Number(
    process.env.LOCKUP_DEFAULT_TARGET_VOTING_PCT || 2000
  ),
  lockupMinDuration: Number(process.env.LOCKUP_MIN_DURATION || 86400 * 14),
  lockupMinAmount: Number(process.env.LOCKUP_MIN_AMOUNT || 10 * 1_000_000),
  lockupMaxSaturation: Number(
    process.env.LOCKUP_MAX_SATURATION || 86400 * 365 * 4
  ),
  proposalMinVotingPowerForQuorum: Number(
    process.env.PROPOSAL_MIN_VOTING_POWER_FOR_QUORUM || 10 * 1_000_000
  ),
  proposalMinPassPct: Number(process.env.PROPOSAL_MIN_PASS_PCT || 60),
};

const requiredEnvVars = [
  "SOLANA_RPC_ENDPOINT",
  "SECURITY_COUNCIL_ADDRESS",
  "REVIEW_COUNCIL_ADDRESS",
  "TOKEN_MINT_ADDRESS",
  "DEPLOYER_KEYPAIR",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length) {
  console.error(chalk.red("\nMissing environment variables:"));
  missingEnvVars.forEach((envVar) =>
    console.error(chalk.yellow(`  - ${envVar}`))
  );
  process.exit(1);
}

const getDeployerKeypair = async (): Promise<Keypair> => {
  try {
    const keypairStr = CONFIG.deployerKeypair;

    // Try parsing as JSON array first
    try {
      const keypairData = JSON.parse(keypairStr);
      if (Array.isArray(keypairData)) {
        return Keypair.fromSecretKey(new Uint8Array(keypairData));
      }
    } catch {} // Ignore JSON parse error

    // If not JSON array, try as base58 string
    try {
      const decodedKey = bs58.decode(keypairStr);
      return Keypair.fromSecretKey(decodedKey);
    } catch {
      throw new Error(
        "Invalid deployer keypair format - must be JSON array or base58 string"
      );
    }
  } catch (error) {
    throw error;
  }
};

const validateConfig = async (): Promise<void> => {
  if (!CONFIG.endpoint.startsWith("http")) {
    throw new Error("Invalid URL");
  }

  try {
    new PublicKey(CONFIG.securityCouncil);
    new PublicKey(CONFIG.reviewCouncil);
    new PublicKey(CONFIG.tokenMint);
  } catch (error) {
    throw new Error("Invalid key");
  }

  if (
    CONFIG.lockupDefaultTargetRewardsPct < 100 ||
    CONFIG.lockupDefaultTargetVotingPct < 100 ||
    CONFIG.lockupDefaultTargetVotingPct > 2500 ||
    CONFIG.lockupMinDuration <= 0 ||
    CONFIG.lockupMinAmount <= 0 ||
    CONFIG.lockupMaxSaturation <= CONFIG.lockupMinDuration ||
    CONFIG.proposalMinVotingPowerForQuorum <= 0 ||
    CONFIG.proposalMinPassPct <= 0 ||
    CONFIG.proposalMinPassPct > 100
  ) {
    throw new Error("Invalid params");
  }
};

(async () => {
  try {
    await validateConfig();

    const connection = new Connection(CONFIG.endpoint, "confirmed");

    const deployerKeypair = await getDeployerKeypair();
    console.log(
      chalk.cyan("\nDeployer Public Key:"),
      chalk.white(deployerKeypair.publicKey.toBase58())
    );

    const balance = await connection.getBalance(deployerKeypair.publicKey);
    console.log(
      chalk.cyan("Deployer Balance:"),
      chalk.white(`${balance / LAMPORTS_PER_SOL} SOL`)
    );

    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      throw new Error("Low balance");
    }

    const sdk = new VeTokenSDK(
      deployerKeypair.publicKey,
      new PublicKey(CONFIG.securityCouncil),
      new PublicKey(CONFIG.reviewCouncil),
      new PublicKey(CONFIG.tokenMint),
      new PublicKey(CONFIG.tokenMint)
    );

    const nsPDA = sdk.pdaNamespace();
    console.log(chalk.cyan("Namespace PDA:"), chalk.white(nsPDA.toBase58()));

    const nsAccount = await connection.getAccountInfo(nsPDA);
    if (nsAccount) {
      console.log(chalk.yellow("\n⚠️  Namespace already exists!"));
      return;
    }

    console.log(chalk.blue("\n📝 Creating namespace transaction..."));
    const tx = sdk.txInitNamespace();

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    tx.sign(deployerKeypair);
    const signature = await connection.sendRawTransaction(tx.serialize());

    console.log(chalk.blue("🚀 Transaction sent!"));
    console.log(chalk.cyan("Transaction Signature:"), chalk.white(signature));
    console.log(chalk.blue("⏳ Waiting for confirmation..."));

    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    if (confirmation.value.err) {
      throw new Error(String(confirmation.value.err));
    }

    console.log(chalk.green("\n✨ Namespace created successfully! 🎉"));
    console.log(
      chalk.cyan("Namespace Address:"),
      chalk.white(nsPDA.toBase58())
    );
    console.log(chalk.cyan("Transaction Signature:"), chalk.white(signature));
  } catch (error) {
    console.error(
      chalk.red("\n❌ Error creating namespace:"),
      chalk.yellow(error)
    );
    process.exit(1);
  }
})();
