import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt } from 'better-auth/plugins';
import { db } from '@/index';
import * as schema from '@/db/schema';

import { type InferSelectModel } from 'drizzle-orm';
type User = InferSelectModel<typeof schema.user>;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      roleId: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [jwt()],
  callbacks: {
    jwt: async ({ token, user }: { token: Record<string, unknown>; user: User | null }) => {
      if (user) {
        token.roleId = user.roleId;
      }
      return token;
    },
    session: async ({
      session,
      user,
    }: {
      session: { user: Record<string, unknown> } & Record<string, unknown>;
      user: User;
    }) => {
      return {
        ...session,
        user: {
          ...session.user,
          roleId: user.roleId,
        },
      };
    },
  },
});
