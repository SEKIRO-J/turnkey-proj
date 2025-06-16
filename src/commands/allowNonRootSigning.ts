import { Command } from 'commander';
import { handleSigningPolicyCreation } from '../handlers/allowNonRootSigningHandler';

// CLI Command Setup
const program = new Command();

program
  .name('allow-non-root-signing')
  .description('Create a policy allowing a non-root user to sign transactions')
  .argument('<username>', 'Username of the non-root user')
  .argument("<walletAddress>", "The wallet address to sign with")
  .action(handleSigningPolicyCreation);

// Execute the CLI program
if (require.main === module) {
  program.parseAsync(process.argv).catch(console.error);
}

export default program;