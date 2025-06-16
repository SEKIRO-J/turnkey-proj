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

export async function handleCreateNonRootUser(userName: string): Promise<void> {
  try {
    console.log("🚀 Creating new non-root user:", userName);
    
    // Validate environment variables
    validateEnvironmentVariables(REQUIRED_ENV_VARS);

    // Initialize Turnkey client
    const turnkeyClient = initializeTurnkeyRootClient();

    // Generate API key
    console.log("🔑 Generating API key...");
    const { publicKey } = generateApiKey(userName, process.env.ORGANIZATION_ID!);

    // Create user
    console.log("👤 Creating user in Turnkey...");
    const userId = await createUser(
      turnkeyClient,
      userName,
      `${userName}-api-key`,
      publicKey,
      process.env.ORGANIZATION_ID!,
    );
    
    console.log("\n✅ User created successfully!");
    console.log("\n🔑 Key Information:");
    console.log(`- User Name: ${userName}`);
    console.log(`- User ID: ${userId}`);
    console.log(`- Keys Directory: ${process.env.HOME}/.config/turnkey/keys/`);
    
  } catch (error) {
    console.error("\n❌ Error creating user:");
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
