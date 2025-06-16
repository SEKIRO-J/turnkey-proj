import { TurnkeyClient } from "@turnkey/http";
import { TurnkeyActivityError } from "@turnkey/sdk-server";
import { execSync } from "child_process";
import { CACHE_DIR } from "../utils/constants";
import { logger, LOG_LEVELS } from "../utils/logger";

// Set log level to INFO to disable debug logs
process.env.LOG_LEVEL = 'INFO';

export default async function createUser(
  turnkeyClient: TurnkeyClient,
  userName: string,
  apiKeyName: string,
  publicKey: string,
  organizationId: string,
): Promise<string> {
  let userTags: string[] = [];
  try {
    logger.info("Creating user with parameters:", {
      userName,
      apiKeyName,
      organizationId
    });

    const response = await turnkeyClient.createApiOnlyUsers({
      type: "ACTIVITY_TYPE_CREATE_API_ONLY_USERS",
      timestampMs: new Date().getTime().toString(),
      organizationId,
      parameters: {
        apiOnlyUsers: [
          {
            userName,
            userTags,
            apiKeys: [
              {
                apiKeyName,
                publicKey,
              },
            ],
          },
        ],
      },
    });

    logger.debug("Response received:", JSON.stringify(response, null, 2));

    const userId = response.activity.result?.createApiOnlyUsersResult?.userIds?.[0];

    if (!userId) {
      logger.error("Failed to get user ID from response:", response);
      throw new Error('Failed to get user ID from response');
    }


    // Save user ID to cache
    saveUserId(userName, userId);
    
    logger.debug(
      [
        ` New user created!`,
        `- Name: ${userName}`,
        `- User ID: ${userId}`,
        `- Keys Directory: ${CACHE_DIR}/`,
        ``,
      ].join("\n"),
    );

    return userId;
  } catch (error) {
    // If needed, you can read from `TurnkeyActivityError` to find out why the activity didn't succeed
    if (error instanceof TurnkeyActivityError) {
      logger.error("Turnkey activity error:", {
        message: error.message,
        cause: error.cause,
        activityId: error.activityId,
        activityStatus: error.activityStatus,
        activityType: error.activityType,
      });
      throw error;
    }

    logger.error("Unexpected error during user creation:", error);
    throw new TurnkeyActivityError({
      message: "Failed to create a new user",
      cause: error as Error,
    });
  }
}

function saveUserId(userName: string, userId: string): void {
  execSync(`mkdir -p ${CACHE_DIR}`);
  
  // Save user ID
  const userIdPath = `${CACHE_DIR}/${userName}.user-id`;
  logger.info("Saving user ID to:", userIdPath);
  execSync(`echo "${userId}" > ${userIdPath}`);
}