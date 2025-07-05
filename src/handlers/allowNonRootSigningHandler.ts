import { TurnkeyServerClient } from '@turnkey/sdk-server';
import { validateEnvironmentVariables } from '../utils/env';
import createPolicy from '../requests/createPolicy';
import getUserByUsername from '../requests/getUserByUsername';
import { initializeTurnkeyRootClient } from '../utils/client';
import { validateEthereumAddress } from '../utils/ethereum';

export async function handleSigningPolicyCreation(username: string, walletAddress: string): Promise<void> {
  try {
     // Validate input addresses
    validateEthereumAddress(walletAddress, 'Wallet address');
    // Define required environment variables
    const requiredVars = [
      'API_PUBLIC_KEY',
      'API_PRIVATE_KEY',
      'ORGANIZATION_ID',
    ];

    // Validate environment variables
    validateEnvironmentVariables(requiredVars);

    const turnkeyClient = initializeTurnkeyRootClient();

    // Get user ID by username
    const userId = await getUserByUsername(turnkeyClient, username);

    // Create policy
    const policyId = await createPolicy(
      turnkeyClient,
      `${username}-signing-policy-${walletAddress.slice(0, 8)}`,
      'EFFECT_ALLOW',
      `approvers.any(user, user.id == '${userId}')`,
      `wallet.address == '${walletAddress}'`,
      `Policy allowing ${username} to sign transactions for wallet ${walletAddress}`,
    );

    console.log('Policy created successfully with ID:', policyId);
  } catch (error) {
    console.error('Error creating policy:', error);
    process.exit(1);
  }
}
