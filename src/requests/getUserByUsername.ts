import { TurnkeyClient } from "@turnkey/http";
import { execSync } from "child_process";
import { CACHE_DIR } from "../utils/constants";
import { validateEnvironmentVariables } from "../utils/env";
import { logger } from '../utils/logger';

// Private method to get user ID from Turnkey API
async function getUserByUsername(
  turnkeyClient: TurnkeyClient,
  username: string,
): Promise<string> {
  try {
    logger.debug("Getting user ID from Turnkey API for username:", username);
    const response = await turnkeyClient.getUsers({
      organizationId: process.env.ORGANIZATION_ID!,
    });

    logger.debug("Response received:", JSON.stringify(response, null, 2));

    const user = response.users.find((u) => u.userName === username);

    if (!user) {
      logger.error("User not found in response:", response);
      throw new Error(`User with username ${username} not found`);
    }

    logger.debug("Found user ID:", user.userId);
    return user.userId;
  } catch (error) {
    logger.error("Error getting user ID from API:", error);
    throw new Error(`Failed to get user ID: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Public method to get user ID (tries cache first, then API)
export default async function getUserId(
  turnkeyClient: TurnkeyClient,
  username: string,
): Promise<string> {
  try {
    // Validate environment variables
    logger.debug("Validating environment variables...");
    validateEnvironmentVariables(["ORGANIZATION_ID"]);
    logger.debug("Environment variables validated successfully");

    // Try to read from cache first
    const cachePath = `${CACHE_DIR}/${username}.user-id`;
    logger.debug("Checking cache for user ID at:", cachePath);

    try {
      const cachedUserId = execSync(`cat ${cachePath} 2>/dev/null || true`).toString().trim();
      if (cachedUserId) {
        logger.debug("Found user ID in cache:", cachedUserId);
        return cachedUserId;
      }
      logger.debug("User ID not found in cache, fetching from API...");
    } catch (error) {
      logger.debug("Cache read error, falling back to API:", error);
    }

    // If not in cache, get from API
    const userId = await getUserByUsername(turnkeyClient, username);

    // Save to cache for future use
    logger.debug("Saving user ID to cache...");
    execSync(`mkdir -p ${CACHE_DIR}`);
    execSync(`echo "${userId}" > ${cachePath}`);
    logger.debug("User ID saved to cache");

    return userId;
  } catch (error) {
    logger.error("Error in getUserId:", error);
    throw new Error(`Failed to get user ID: ${error instanceof Error ? error.message : String(error)}`);
  }
}