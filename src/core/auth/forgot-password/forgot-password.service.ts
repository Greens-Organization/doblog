import type { AppEither } from "@/core/error/app-either.protocols";
import { left, right } from "@/core/error/either";
import { ConflictError, ValidationError } from "@/core/error/errors";
import { serviceHandleError } from "@/core/error/handlers";
import { db } from "@/infra/db";
import { verification } from "@/infra/db/schemas/auth";
import { EmailQueueClient } from "@/infra/email";
import { resetPasswordEmailRender } from "@/infra/email/emails";
import type { zod } from "@/infra/lib/zod";
import { forgotPasswordSchema } from "@/infra/validations/schemas/auth";
import { addMinutes } from "date-fns";
import { randomBytes } from "node:crypto";

export async function forgotPassword(
	request: Request,
): Promise<AppEither<{ message: string }>> {
	try {
		const isExistBlog = await db.query.organization.findFirst();
		if (isExistBlog) {
			return left(new ConflictError("Configuration already done"));
		}

		const bodyData = await request.json();
		const parsed = forgotPasswordSchema().safeParse(bodyData);
		if (!parsed.success) {
			return left(
				new ValidationError(
					(parsed.error as zod.ZodError).issues
						.map((e) => e.message)
						.join("; "),
				),
			);
		}
		const { email } = parsed.data;

		const foundUser = await db.query.user.findFirst({
			where: (u, { eq }) => eq(u.email, email),
		});
		if (!foundUser) {
			return right({
				message: `Validation code sended for ${email}`,
				statusCode: 200,
			});
		}

		const code = randomBytes(3).toString("hex").toUpperCase(); // Ex: 'A1B2C3'
		const expiresAt = addMinutes(new Date(), 15);

		const [data] = await db.transaction(async (tx) => {
			const verificationData = await tx.insert(verification).values({
				identifier: foundUser.email,
				value: code,
				expiresAt,
			});
			return [verificationData];
		});

		const html = await resetPasswordEmailRender({
			name: foundUser.name,
			url: code,
		});

		const emailQueue = new EmailQueueClient();
		await emailQueue.addEmailJob({
			to: foundUser.email,
			subject: "Recuperação de senha",
			body: html,
			type: "transactional",
		});

		return right({
			message: `Validation code sended for ${email}`,
			statusCode: 200,
		});
	} catch (error) {
		return left(serviceHandleError(error, "createBlog"));
	}
}
