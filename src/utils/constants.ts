const homeDir = process.env.HOME || process.env.USERPROFILE;
if (!homeDir) {
  throw new Error("Could not determine home directory");
}
// Default cache directory
const CACHE_DIR_NAME = ".cache/turnkey";
export const CACHE_DIR = `${homeDir}/${CACHE_DIR_NAME}`;

// Default Key directory
export const KEY_DIR_NAME = '.config/turnkey/keys';
export const KEY_DIR = `${homeDir}/${KEY_DIR_NAME}`; 