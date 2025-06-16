import { Command } from 'commander';
import { TurnkeyServerClient } from '@turnkey/sdk-server';
import { ApiKeyStamper } from '@turnkey/api-key-stamper';
import { validateEnvironmentVariables } from '../utils/env';
import createPolicy from '../requests/createPolicy';
import getUserByUsername from '../requests/getUserByUsername';
import { initializeTurnkeyRootClient } from '../utils/client';

// Main Policy Creation Function
async function handlePolicyCreation(username: string): Promise<void> {
  try {
    // Define required environment variables
    const requiredVars = [
      'API_PUBLIC_KEY',
      'API_PRIVATE_KEY',
      'ORGANIZATION_ID',
    ];

    // Validate environment variables
    validateEnvironmentVariables(requiredVars);

    // Initialize Turnkey client
    const stamper = new ApiKeyStamper({
      apiPublicKey: process.env.API_PUBLIC_KEY!,
      apiPrivateKey: process.env.API_PRIVATE_KEY!,
    });

    const turnkeyClient = initializeTurnkeyRootClient();

    // Get user ID by username
    const userId = await getUserByUsername(turnkeyClient, username);

    // Create policy
    const policyId = await createPolicy(
      turnkeyClient,
      `${username}-signing-policy`,
      'EFFECT_ALLOW',
      `approvers.any(user, user.id == '${userId}')`,
      `wallet_account.address == '${process.env.ETH_WALLET_ACCOUNT}'`, // Allow all transaction signing for a wallet address
      'Policy allowing non-root user to sign transactions',
    );

    console.log('Policy created successfully with ID:', policyId);
  } catch (error) {
    console.error('Error creating policy:', error);
    process.exit(1);
  }
}

// CLI Command Setup
const program = new Command();

program
  .name('allow-non-root-signing')
  .description('Create a policy allowing a non-root user to sign transactions')
  .argument('<username>', 'Username of the non-root user')
  .action(handlePolicyCreation);

// Execute the CLI program
if (require.main === module) {
  program.parseAsync(process.argv).catch(console.error);
}

export default program;