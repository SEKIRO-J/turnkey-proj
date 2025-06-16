import { TurnkeyClient } from "@turnkey/http";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import { validateEnvironmentVariables } from "./env";


export interface TurnKeyClientApiKeys {
  apiPublicKey: string;
  apiPrivateKey: string;
}

export function initializeTurnkeyRootClient(): TurnkeyClient {
  // Initialize Turnkey client
  const stamper = new ApiKeyStamper({
    apiPublicKey: process.env.API_PUBLIC_KEY!,
    apiPrivateKey: process.env.API_PRIVATE_KEY!,
  });

  const turnkeyClient = new TurnkeyClient({
    baseUrl: process.env.BASE_URL!,
  }, stamper);

  return turnkeyClient;
}

export function initializeTurnkeyClientWithKeys(keys: TurnKeyClientApiKeys): TurnkeyClient {
  // Initialize Turnkey client with provided keys
  const stamper = new ApiKeyStamper({
    apiPublicKey: keys.apiPublicKey,
    apiPrivateKey: keys.apiPrivateKey,
  });

  const turnkeyClient = new TurnkeyClient({
    baseUrl: process.env.BASE_URL!,
  }, stamper);

  return turnkeyClient;
}
