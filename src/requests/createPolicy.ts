import { TurnkeyClient } from "@turnkey/http";
import {
  TurnkeyActivityError,
} from "@turnkey/sdk-server";
  
export default async function createPolicy(
  turnkeyClient: TurnkeyClient,
  policyName: string,
  effect: "EFFECT_ALLOW" | "EFFECT_DENY",
  consensus: string,
  condition: string,
  notes: string,
): Promise<string> {
  try {
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
      throw new Error("Failed to create policy: missing policy ID in response");
    }

    // Success!
    console.log(
      [
        `New policy created!`,
        `- Name: ${policyName}`,
        `- Policy ID: ${policyId}`,
        `- Effect: ${effect}`,
        `- Consensus: ${consensus}`,
        `- Condition: ${condition}`,
        ``,
      ].join("\n"),
    );

    return policyId;
  } catch (error) {
    // If needed, you can read from `TurnkeyActivityError` to find out why the activity didn't succeed
    if (error instanceof TurnkeyActivityError) {
      throw error;
    }

    throw new TurnkeyActivityError({
      message: "Failed to create a new policy",
      cause: error as Error,
    });
  }
}