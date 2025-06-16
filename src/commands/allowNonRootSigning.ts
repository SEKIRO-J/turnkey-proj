import { Command } from 'commander';
import { handlePolicyCreation } from '../handlers/allowNonRootSigningHandler';

// CLI Command Setup
const program = new Command();

program
  .name('allow-non-root-signing')
  .description('Create a policy allowing a non-root user to sign transactions')
  .argument('<username>', 'Username of the non-root user')
  .action(handlePolicyCreation);

// Execute the CLI program
if (require.main === module) {
  program.parseAsync(process.argv).catch(console.error);
}

export default program;