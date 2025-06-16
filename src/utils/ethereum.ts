/**
 * Validates if a string is a valid Ethereum address
 * @param address The address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates an Ethereum address and throws an error if invalid
 * @param address The address to validate
 * @param fieldName Optional field name for the error message
 * @throws Error if the address is invalid
 */
export function validateEthereumAddress(address: string, fieldName: string = 'Address'): void {
  if (!isValidEthereumAddress(address)) {
    throw new Error(`${fieldName} is not a valid Ethereum address: ${address}`);
  }
}
