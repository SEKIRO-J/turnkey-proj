// File: /Users/jay/turnkey-proj/src/handlers/allowNonRootSigningERC20TransferToTarget.ts

import { TurnkeyServerClient } from '@turnkey/sdk-server';
import { validateEnvironmentVariables } from '../utils/env';
import { validateEthereumAddress } from '../utils/ethereum';
import createPolicy from '../requests/createPolicy';
import getUserByUsername from '../requests/getUserByUsername';
import { initializeTurnkeyRootClient } from '../utils/client';

export async function handleCreateERC20TransferPolicy(
  username: string, 
  contractAddress: string,
  recipientAddress: string
): Promise<void> {
  try {
    // Validate input addresses
    validateEthereumAddress(contractAddress, 'Contract address');
    validateEthereumAddress(recipientAddress, 'Recipient address');

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
    
    // Create policy with the contract address and transfer condition
    const policyId = await createPolicy(
      turnkeyClient,
      `${username}-erc20-${contractAddress.slice(0, 8)}-to-${recipientAddress.slice(0,8)}-transfer-policy`,
      'EFFECT_ALLOW',
      `approvers.any(user, user.id == '${userId}')`,
      `eth.tx.to == '${contractAddress.toLowerCase()}' && eth.tx.data[0..10] == '0xa9059cbb' && eth.tx.data[16..56] == '${recipientAddress.toLowerCase()}'`,
      `Policy allowing ${username} to transfer ERC20 tokens from ${contractAddress} to ${recipientAddress}`
    );

    console.log(`✅ Policy created successfully! Policy ID: ${policyId}`);
  } catch (error) {
    console.error('Error creating policy:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}
