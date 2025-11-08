import type { BetterAuthPlugin } from "better-auth";

const DEV_EMAIL = "vhenz@college.harvard.edu";
const DEV_PASSWORD = "123456";

/**
 * Seeds a fixed credential account when running the dev server.
 */
export function devAuthSeedPlugin(): BetterAuthPlugin {
  return {
    id: "dev-auth-seed",
    async init(ctx) {
      if (process.env.NODE_ENV !== "development") {
        return;
      }

      const email = process.env.DEV_LOGIN_EMAIL || DEV_EMAIL;
      const password = process.env.DEV_LOGIN_PASSWORD || DEV_PASSWORD;
      const name = "Development User";

      const existingUser = await ctx.internalAdapter.findUserByEmail(email, {
        includeAccounts: true,
      });

      const hashedPassword = await ctx.password.hash(password);

      if (!existingUser) {
        const user = await ctx.internalAdapter.createUser({
          email,
          emailVerified: true,
          name,
        });

        await ctx.internalAdapter.createAccount({
          userId: user.id,
          providerId: "credential",
          accountId: email,
          password: hashedPassword,
        });

        ctx.logger.info("Created development credential user", { email });
        return;
      }

      const { user, accounts = [] } = existingUser;

      if (!user.emailVerified) {
        await ctx.internalAdapter.updateUser(user.id, {
          emailVerified: true,
        });
      }

      const credentialAccount = accounts.find(
        (account) => account.providerId === "credential",
      );

      if (!credentialAccount) {
        await ctx.internalAdapter.createAccount({
          userId: user.id,
          providerId: "credential",
          accountId: email,
          password: hashedPassword,
        });
        ctx.logger.info("Attached credential account to development user", { email });
        return;
      }

      const passwordMatches =
        credentialAccount.password &&
        (await ctx.password.verify({
          hash: credentialAccount.password,
          password,
        }));

      if (!passwordMatches) {
        await ctx.internalAdapter.updateAccount(credentialAccount.id, {
          password: hashedPassword,
        });
        ctx.logger.info("Updated development credential password hash", { email });
      }
    },
  };
}
