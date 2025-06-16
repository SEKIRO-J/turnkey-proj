import { TurnkeyClient } from "@turnkey/http";
import { execSync } from "child_process";
import { CACHE_DIR } from "../utils/constants";
import { validateEnvironmentVariables } from "../utils/env";

// Private method to get user ID from Turnkey API
async function getUserByUsername(
  turnkeyClient: TurnkeyClient,
  username: string,
): Promise<string> {
  try {
    console.log("Getting user ID from Turnkey API for username:", username);
    const response = await turnkeyClient.getUsers({
      organizationId: process.env.ORGANIZATION_ID!,
    });

    console.log("Response received:", JSON.stringify(response, null, 2));

    const user = response.users.find((u) => u.userName === username);

    if (!user) {
      console.error("User not found in response:", response);
      throw new Error(`User with username ${username} not found`);
    }

    console.log("Found user ID:", user.userId);
    return user.userId;
  } catch (error) {
    console.error("Error getting user ID from API:", error);
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
    console.log("Validating environment variables...");
    validateEnvironmentVariables(["ORGANIZATION_ID"]);
    console.log("Environment variables validated successfully");

    // Try to read from cache first
    const cachePath = `${CACHE_DIR}/${username}.user-id`;
    console.log("Checking cache for user ID at:", cachePath);

    try {
      const cachedUserId = execSync(`cat ${cachePath}`, { encoding: "utf-8" }).trim();
      console.log("Found user ID in cache:", cachedUserId);
      return cachedUserId;
    } catch (cacheError) {
      console.log("User ID not found in cache, fetching from API...");
    }

    // If not in cache, get from API
    const userId = await getUserByUsername(turnkeyClient, username);

    // Save to cache for future use
    console.log("Saving user ID to cache...");
    execSync(`mkdir -p ${CACHE_DIR}`);
    execSync(`echo "${userId}" > ${cachePath}`);
    console.log("User ID saved to cache");

    return userId;
  } catch (error) {
    console.error("Error in getUserId:", error);
    throw new Error(`Failed to get user ID: ${error instanceof Error ? error.message : String(error)}`);
  }
} 