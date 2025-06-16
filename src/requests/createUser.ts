import { TurnkeyClient } from "@turnkey/http";
import { TurnkeyActivityError } from "@turnkey/sdk-server";
import { execSync } from "child_process";
import { CACHE_DIR } from "../utils/constants";

export default async function createUser(
  turnkeyClient: TurnkeyClient,
  userName: string,
  apiKeyName: string,
  publicKey: string,
  organizationId: string,
): Promise<void> {
  let userTags: string[] = new Array();
  try {
    console.log("Creating user with parameters:", {
      userName,
      apiKeyName,
      organizationId,
      publicKeyLength: publicKey.length,
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

    console.log("Response received:", JSON.stringify(response, null, 2));

    // The response structure from the SDK is different from the API response
    const userId = response.activity.result?.createApiOnlyUsersResult?.userIds?.[0];

    if (!userId) {
      console.error("Failed to get user ID from response:", response);
      throw new Error('Failed to get user ID from response');
    }

    // Success!
    console.log(
      [
        `New user created!`,
        `- Name: ${userName}`,
        `- User ID: ${userId}`,
        ``,
      ].join("\n"),
    );

    saveUserId(userName, userId);
  } catch (error) {
    // If needed, you can read from `TurnkeyActivityError` to find out why the activity didn't succeed
    if (error instanceof TurnkeyActivityError) {
      console.error("Turnkey activity error:", {
        message: error.message,
        cause: error.cause,
        activityId: error.activityId,
        activityStatus: error.activityStatus,
        activityType: error.activityType,
      });
      throw error;
    }

    console.error("Unexpected error during user creation:", error);
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
  console.log("Saving user ID to:", userIdPath);
  execSync(`echo "${userId}" > ${userIdPath}`);
} 