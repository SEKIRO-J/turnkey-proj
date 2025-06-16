import { TurnkeyClient } from "@turnkey/http";
import { TurnkeyActivityError } from "@turnkey/sdk-server";
import { logger } from '../utils/logger';

export default async function createPolicy(
  turnkeyClient: TurnkeyClient,
  policyName: string,
  effect: "EFFECT_ALLOW" | "EFFECT_DENY",
  consensus: string,
  condition: string,
  notes: string,
): Promise<string> {
  try {
    logger.debug('Creating policy with parameters:', {
      policyName,
      effect,
      consensus,
      condition,
      notes
    });

    const response = await turnkeyClient.createPolicy({
      type: "ACTIVITY_TYPE_CREATE_POLICY_V3",
      timestampMs: Date.now().toString(),
      organizationId: process.env.ORGANIZATION_ID!,
      parameters: {
        policyName,
        condition,
        consensus,
        effect,
        notes,
      },
    });

    // Extract the policy ID from the response
    const policyId = response.activity.result.createPolicyResult?.policyId;
    if (!policyId) {
      const errorMessage = "Failed to create policy: missing policy ID in response";
      logger.error(errorMessage, { response });
      throw new Error(errorMessage);
    }

    logger.info('Successfully created policy', {
      policyId,
      policyName,
      effect,
      consensus
    });

    return policyId;
  } catch (error) {
    let errorMessage = 'Failed to create policy';
    
    if (error instanceof TurnkeyActivityError) {
      errorMessage = `Turnkey activity error: ${error.message}`;
      logger.error(errorMessage, {
        name: error.name,
        message: error.message,
        activityId: error.activityId,
        activityStatus: error.activityStatus,
        cause: error.cause
      });
    } else if (error instanceof Error) {
      errorMessage = `Error creating policy: ${error.message}`;
      logger.error(errorMessage, { stack: error.stack });
    } else {
      logger.error('Unknown error creating policy', { error });
    }
    
    logger.debug('Full error object:', JSON.stringify(error, null, 2));
    throw new Error(errorMessage);
  }
}