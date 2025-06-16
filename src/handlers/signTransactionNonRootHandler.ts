import { TurnkeyClient } from "@turnkey/http";
import { validateEnvironmentVariables } from "../utils/env";
import { loadNonRootUserKey } from "../utils/keys";
import { initializeTurnkeyClientWithKeys } from "../utils/client";
import { logger } from '../utils/logger';
import { validateEthereumAddress } from "../utils/ethereum";

// Required environment variables
const REQUIRED_ENV_VARS = [
  "BASE_URL",
  "ORGANIZATION_ID"
];

export async function handleSignTransactionNonRoot(
  userName: string,
  transactionId: string,
  walletAddress: string
): Promise<void> {
  try {
    // Validate input wallet address
    validateEthereumAddress(walletAddress, 'Wallet address');
    logger.info(`🚀 Starting transaction signing for user: ${userName}`);
    logger.info(`Transaction ID: ${transactionId}`);
    
    // Validate environment variables first
    logger.debug("Validating environment variables...");
    validateEnvironmentVariables(REQUIRED_ENV_VARS);
    logger.debug("Environment variables validated successfully");

    // Load non-root user key
    logger.debug(`Loading keys for user: ${userName}...`);
    const { publicKey, privateKey } = loadNonRootUserKey(userName);
    logger.debug("User keys loaded successfully");

    // Create new client with non-root user key
    logger.debug("Initializing Turnkey client...");
    const nonRootClient = initializeTurnkeyClientWithKeys({
      apiPublicKey: publicKey,
      apiPrivateKey: privateKey,
    });
    logger.debug("Turnkey client initialized");

    // Sign transaction
    logger.debug("Signing transaction...");
    
    // Prepare the request
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
    
    logger.info(`Using wallet address for signing: ${walletAddress}`);
    
    logger.debug("Sending sign transaction request...");
    logger.debug("Request payload:", JSON.stringify(request, null, 2));
    
    const response = await nonRootClient.signTransaction(request);
    
    logger.info("✅ Transaction signed successfully!");
    if (!response?.activity?.result?.signTransactionResult?.signedTransaction) {
        throw new Error("Invalid response from Turnkey: Missing signed transaction data");
    }
    const signedTx = response.activity.result.signTransactionResult.signedTransaction;
    logger.info("📝 Signed Transaction:", signedTx);
    logger.debug("Full response:", JSON.stringify(response, null, 2));
    
    return;
  } catch (error) {
    logger.error("❌ Error signing transaction:");
    if (error instanceof Error) {
      logger.error(`Error name: ${error.name}`);
      logger.error(`Error message: ${error.message}`);
      if (error.stack) {
        logger.debug("Stack trace:", error.stack);
      }
    } else {
      logger.error("Unknown error:", error);
    }
    throw error;
  }
}
