import { ac, admin, editor } from "@/core/auth/permissions";
import { blogRepository } from "@/core/blog/repository";
import { env } from "@/env";
import { makePasswordHasher } from "@/infra/cryptography/password";
import { db } from "@/infra/db";
import {
	account,
	invitation,
	member,
	organization as org,
	session,
	user,
	verification,
} from "@/infra/db/schemas/auth";
import { EmailQueueClient } from "@/infra/email";
import {
	emailVerificationRender,
	resetPasswordEmailRender,
} from "@/infra/email/emails";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user,
			session,
			account,
			verification,
			invitation,
			member,
			organization: org,
		},
	}),
	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					const organization = await blogRepository.getBlog();
					return {
						data: {
							...session,
							activeOrganizationId: organization?.id,
						},
					};
				},
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			secure: true,
			httpOnly: true,
		},
	},
	emailAndPassword: {
		enabled: true,
		disableSignUp: false,
		password: {
			hash: makePasswordHasher().hash,
			verify: makePasswordHasher().compare,
		},
		minPasswordLength: 8,
		maxPasswordLength: 128,
		sendResetPassword: async (data, request) => {
			const blogData = await blogRepository.getBlog();
			const html = await resetPasswordEmailRender({
				name: data.user.name,
				url: data.url,
				blog: blogData,
			});

			const emailQueue = new EmailQueueClient();

			await emailQueue.addEmailJob({
				to: data.user.email,
				subject: "Reset Password",
				body: html,
				type: "transactional",
			});
		},
		requireEmailVerification: true,
	},
	emailVerification: {
		sendVerificationEmail: async (data, request) => {
			const blogData = await blogRepository.getBlog();
			const html = await emailVerificationRender({
				name: data.user.name,
				url: data.url,
				blog: blogData,
			});

			const emailQueue = new EmailQueueClient();
			await emailQueue.addEmailJob({
				to: data.user.email,
				subject: "Reset Password",
				body: html,
				type: "transactional",
			});
		},
	},
	// socialProviders: socialProviders[0],
	plugins: [
		nextCookies(),
		organization({
			// organizationCreation: {
			//   disabled: true,
			// },
			ac,
			roles: {
				admin,
				editor,
			},
		}),
	],
	user: {
		additionalFields: {
			role: {
				type: "string",
			},
		},
	},
});
