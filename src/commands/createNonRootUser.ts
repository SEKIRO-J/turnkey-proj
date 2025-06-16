import { Command } from 'commander';
import { validateEnvironmentVariables } from '../utils/env';
import { generateApiKey } from '../utils/keys';
import { initializeTurnkeyRootClient } from '../utils/client';
import createUser from '../requests/createUser';

// Required environment variables
const REQUIRED_ENV_VARS = [
  "API_PUBLIC_KEY",
  "API_PRIVATE_KEY",
  "BASE_URL",
  "ORGANIZATION_ID",
];

// Main User Creation Function
async function createNonRootUser(userName: string): Promise<void> {
  try {
    console.log("Starting user creation process...");
    console.log(`Username: ${userName}`);
    // Validate environment variables
    validateEnvironmentVariables(REQUIRED_ENV_VARS);

    // Initialize Turnkey client
    const turnkeyClient = initializeTurnkeyRootClient();

    // Generate API key
    console.log("Generating new API key...");
    const { publicKey } = generateApiKey(userName, process.env.ORGANIZATION_ID!);

    // Create user
    console.log("Creating user in Turnkey...");
    await createUser(
      turnkeyClient,
      userName,
      `${userName}-api-key`,
      publicKey,
      process.env.ORGANIZATION_ID!,
    );

    console.log("\nUser created successfully!");
    console.log("Keys and user ID saved in:", `${process.env.HOME}/.config/turnkey/keys/`);
  } catch (error) {
    console.error("\nError creating user:");
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }
}

// CLI Command Setup
const program = new Command();

program
  .name('create-non-root-user')
  .description('Create a non-root user with an API key')
  .argument('<username>', 'Username for the new user')
  .action(createNonRootUser);

program.parse(process.argv);

export default program; 