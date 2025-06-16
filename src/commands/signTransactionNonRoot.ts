import { TurnkeyClient } from "@turnkey/http";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import { validateEnvironmentVariables } from "../utils/env";
import { loadNonRootUserKey } from "../utils/keys";
import { initializeTurnkeyClientWithKeys } from "../utils/client";
import { Command } from "commander";

// Required environment variables
const REQUIRED_ENV_VARS = [
  "BASE_URL",
  "ORGANIZATION_ID"
];

// Sign transaction with non-root user
async function signTransactionNonRoot(
  userName: string,
  transactionId: string,
): Promise<unknown> {
  console.log(`Starting transaction signing for user: ${userName}`);
  console.log(`Transaction ID: ${transactionId}`);
  
  try {
    // Validate environment variables first
    console.log("Validating environment variables...");
    validateEnvironmentVariables(REQUIRED_ENV_VARS);
    console.log("Environment variables validated successfully");

    // Load non-root user key
    console.log(`Loading keys for user: ${userName}...`);
    const { publicKey, privateKey } = loadNonRootUserKey(userName);
    console.log("User keys loaded successfully");

    // Create new client with non-root user key
    console.log("Initializing Turnkey client...");
    const nonRootClient = initializeTurnkeyClientWithKeys({
      apiPublicKey: publicKey,
      apiPrivateKey: privateKey,
    });
    console.log("Turnkey client initialized");

    // Sign transaction
    console.log("Signing transaction...");
    const walletAddress = process.env.ETH_WALLET_ACCOUNT;
    if (!walletAddress) {
      throw new Error("ETH_WALLET_ACCOUNT environment variable is not set");
    }
    
    console.log(`Using wallet address for signing: ${walletAddress}`);
    
    const request = {
      type: "ACTIVITY_TYPE_SIGN_TRANSACTION_V2" as const,
      timestampMs: new Date().getTime().toString(),
      parameters: {
        signWith: walletAddress,
        unsignedTransaction: transactionId,
        type: "TRANSACTION_TYPE_ETHEREUM" as const,
      },
      organizationId: process.env.ORGANIZATION_ID!,
    };
    
    console.log("Sending sign transaction request...");
    console.log("Request payload:", JSON.stringify(request, null, 2));
    
    const response = await nonRootClient.signTransaction(request);
    console.log("✅ Transaction signed successfully");
    console.log("Response:", JSON.stringify(response, null, 2));
    
    return response;
  } catch (error) {
    console.error("❌ Error details:");
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      if ('stack' in error) {
        console.error("Stack trace:", (error as any).stack);
      }
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }
}


// CLI Command Setup
const program = new Command();

program
  .name('sign-transaction-non-root')
  .description('Sign a transaction as a non-root user')
  .argument('<username>', 'Username of the non-root user')
  .argument('<transactionId>', 'Transaction ID to sign')
  .action(async (username, transactionId) => {
    try {
      await signTransactionNonRoot(username, transactionId);
    } catch (error) {
      console.error('Fatal error in command execution:', error);
      process.exit(1);
    }
  });

// Add global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Add global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Only run the command if this file is executed directly
if (require.main === module) {
  program.parseAsync(process.argv).catch(error => {
    console.error('Failed to parse command:', error);
    process.exit(1);
  });
}

export default program; 
