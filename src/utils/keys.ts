import { execSync } from "child_process";
import { KEY_DIR } from "./constants";

// Types
export interface ApiKeyOutput {
  privateKeyFile: string;
  publicKey: string;
  publicKeyFile: string;
}

export interface TurnKeyClientApiKeys {
  publicKey: string;
  privateKey: string;
}

// API key generation
export function generateApiKey(userName: string, organizationId: string): { publicKey: string } {
  console.log("Generating API key...");
  const keyName = `${userName}-api-key`;
  const command = `turnkey generate api-key --organization ${organizationId} --key-name ${keyName}`;
  console.log("Running command:", command);
  
  const output = execSync(command, { encoding: "utf-8" });
  console.log("API key generation output:", output);
  
  try {
    const keyData: ApiKeyOutput = JSON.parse(output);
    console.log("Parsed key data:", {
      publicKey: keyData.publicKey,
      privateKeyFile: keyData.privateKeyFile,
      publicKeyFile: keyData.publicKeyFile
    });
    
    return { 
      publicKey: keyData.publicKey
    };
  } catch (error) {
    throw new Error(`Failed to parse API key output: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function loadNonRootUserKey(userName: string): TurnKeyClientApiKeys {
  const publicKeyPath = `${KEY_DIR}/${userName}-api-key.public`;
  const privateKeyPath = `${KEY_DIR}/${userName}-api-key.private`;

  try {
    let publicKey = execSync(`cat ${publicKeyPath}`, { encoding: 'utf-8' }).trim();
    let privateKey = execSync(`cat ${privateKeyPath}`, { encoding: 'utf-8' }).trim();

    // Remove the :p256 suffix from the private key if it exists
    if (privateKey.endsWith(':p256')) {
      privateKey = privateKey.slice(0, -5);
    }

    console.log("Keys loaded successfully");
    console.log("Public key (first 10 chars):", publicKey.slice(0, 10) + "...");
    console.log("Private key (first 10 chars):", privateKey.slice(0, 10) + "...");

    return { publicKey, privateKey };
  } catch (error) {
    console.error("Error loading keys:", error);
    throw new Error(`Failed to load keys for user ${userName}`);
  }
}

