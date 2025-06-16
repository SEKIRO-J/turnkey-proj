# Turnkey CLI Tools

This project provides CLI tools for managing Turnkey users, policies, and transaction signing.

## Prerequisites

1. Install the Turnkey CLI:
```bash
brew install tkhq/tap/turnkey
```

2. Install project dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory with your root user credentials:
```bash
API_PUBLIC_KEY=your_root_public_key
API_PRIVATE_KEY=your_root_private_key
ORGANIZATION_ID=your_organization_id
ETH_WALLET_ACCOUNT=0xYourWalletAddress
API_URL=https://api.turnkey.com  
```

## Available Commands

### 1. Create a Non-Root User

Create a new user with automatically generated API credentials:

```bash
pnpm run create-non-root-user <username> [--email <email>]
```

Example:
```bash
pnpm run create-non-root-user john-doe --email john@example.com
```

This command will:
- Generate a new API key pair using the Turnkey CLI
- Create the user in your Turnkey organization
- Store the private key locally (managed by Turnkey CLI)
- Save key information in the `${HOME}/.config/turnkey/keys` directory

### 2. Allow Non-Root User to Sign Transactions

Create a policy that allows a non-root user to sign transactions:

```bash
pnpm run allow-non-root-signing <username>
```

Example:
```bash
pnpm run allow-non-root-signing john-doe
```

This command will:
- Create a policy that allows the specified user to sign transactions
- The policy will be scoped to the wallet address specified in your `.env` file
- Output the policy ID upon successful creation

### 3. Sign a Transaction (Non-Root User)

Sign a transaction using a non-root user's credentials:

```bash
pnpm run sign-transaction-non-root <username> <unsignedTransaction>
```

Example:
```bash
pnpm run sign-transaction-non-root john-doe 0x02e883aa36a78083124f80831250a2825208943b8d544b448100e719909d5be512f0faf841ac820180c0
```

This command will:
- Load the specified user's credentials
- Sign the provided transaction
- Output the signed transaction data

## Environment Variables

Ensure your `.env` file includes the following variables:

```bash
# Required for all commands
API_PUBLIC_KEY=your_root_public_key
API_PRIVATE_KEY=your_root_private_key
ORGANIZATION_ID=your_organization_id
ETH_WALLET_ACCOUNT=0xYourWalletAddress
API_URL=https://api.turnkey.com  
```

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- The private API keys are stored locally by the Turnkey CLI
- Key information is saved in the `${HOME}/.config/turnkey/keys` directory for reference
- Store all API credentials securely
- Ensure proper policies are in place before allowing transaction signing

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Ensure the user has the correct policies assigned
   - Verify the wallet address in your `.env` matches the intended target

2. **Invalid Transaction Data**
   - Ensure the transaction data is properly formatted
   - Verify the transaction is compatible with the target wallet

3. **API Connection Issues**
   - Check your internet connection
   - Verify the API_URL is correct if using a custom endpoint

For additional help, refer to the [Turnkey Documentation](https://docs.turnkey.com/).