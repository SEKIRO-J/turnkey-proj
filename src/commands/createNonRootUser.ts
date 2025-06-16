import { Command } from "commander";
import { handleCreateNonRootUser } from "../handlers/createNonRootUserHandler";
import { logger } from "../utils/logger";

// CLI Command Setup
const program = new Command();

program
  .name("create-non-root-user")
  .description("Create a new non-root user in Turnkey")
  .argument("<username>", "Username for the new non-root user")
  .action(handleCreateNonRootUser);

// Execute the CLI program
if (require.main === module) {
  program.parseAsync(process.argv).catch((error) => {
    logger.error("Command failed:", error);
    process.exit(1);
  });
}

export default program;