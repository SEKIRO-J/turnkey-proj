import { Command } from "commander";
import { handleSignTransactionNonRoot } from "../handlers/signTransactionNonRootHandler";

// CLI Command Setup
const program = new Command();

program
  .name("sign-transaction-non-root")
  .description("Sign a transaction using a non-root user's credentials")
  .argument("<username>", "Username of the non-root user")
  .argument("<transactionId>", "The transaction ID to sign")
  .argument("<walletAddress>", "The wallet address to sign with")
  .action(handleSignTransactionNonRoot);

// Execute the CLI program
if (require.main === module) {
  program.parseAsync(process.argv).catch(console.error);
}

export default program;
