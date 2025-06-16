import { Command } from 'commander';
import { handleCreateERC20TransferPolicy } from '../handlers/allowNonRootSigningERC20TransferToRecipient';

const program = new Command();

program
  .name('allow--non-root-erc20-transfer-to-recipients')
  .description('Create a policy allowing a non-root user to transfer ERC20 tokens to specific recipient address')
  .argument('<username>', 'Username of the non-root user')
  .argument('<contractAddress>', 'The ERC20 token contract address')
  .argument('<recipientAddress>', 'The recipient address')
  .action(handleCreateERC20TransferPolicy);

// Execute the CLI program
if (require.main === module) {
  program.parse(process.argv);
}

export default program;
