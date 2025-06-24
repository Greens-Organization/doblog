import type { AppEither } from "@/core/error/app-either.protocols";
import { left, right } from "@/core/error/either";
import {
	NotFoundError,
	UnauthorizedError,
	ValidationError,
} from "@/core/error/errors";
import { serviceHandleError } from "@/core/error/handlers";
import { db } from "@/infra/db";
import { post, subcategory } from "@/infra/db/schemas/blog";
import { extractAndValidatePathParams } from "@/infra/helpers/params";
import { auth } from "@/infra/lib/better-auth/auth";
import { zod } from "@/infra/lib/zod";
import { and, eq } from "drizzle-orm";
import type { ISubcategoryDTO } from "../dto";

const pathParamSchema = zod.object({
	id: zod.uuid("Invalid subcategory ID"),
});

export async function deleteSubcategory(
	request: Request,
): Promise<AppEither<{ message: string; deleted: ISubcategoryDTO }>> {
	try {
		const canAccess = await auth.api.hasPermission({
			headers: request.headers,
			body: {
				permissions: {
					subcategory: ["delete"],
				},
			},
		});

		if (!canAccess.success) {
			return left(
				new UnauthorizedError("You do not have permission to do this"),
			);
		}

		const parsedParam = extractAndValidatePathParams(request, pathParamSchema, [
			"id",
		]);
		if (!parsedParam.success) {
			return left(
				new ValidationError(
					(parsedParam.error as zod.ZodError).issues
						.map((e) => e.message)
						.join("; "),
				),
			);
		}
		const { id } = parsedParam.data;

		const existingSubcategory = await db.query.subcategory.findFirst({
			where: eq(subcategory.id, id),
			columns: {
				categoryId: false,
			},
			with: {
				category: {
					columns: {
						id: true,
						name: true,
						slug: true,
						description: true,
					},
				},
			},
		});

		if (!existingSubcategory) {
			return left(new NotFoundError("Subcategory not found"));
		}

		if (existingSubcategory.isDefault) {
			return left(new ValidationError("Cannot delete default subcategory"));
		}

		const subcategoryDefault = await db.query.subcategory.findFirst({
			where: and(
				eq(subcategory.isDefault, true),
				eq(subcategory.categoryId, existingSubcategory.category.id),
			),
		});

		if (!subcategoryDefault) {
			return left(
				new NotFoundError(
					"Default subcategory not found, please set one before deleting this subcategory",
				),
			);
		}

		const deletedData = await db.transaction(async (tx) => {
			const currentPosts = await db.query.post.findMany({
				where: eq(subcategory.id, existingSubcategory.id),
				columns: {
					id: true,
				},
			});

			if (currentPosts.length > 0) {
				await tx
					.update(post)
					.set({ subcategoryId: subcategoryDefault.id })
					.where(eq(post.subcategoryId, existingSubcategory.id));
			}

			// Deleta a subcategoria
			const [{ categoryId, ...deletedSubcategory }] = await tx
				.delete(subcategory)
				.where(eq(subcategory.id, existingSubcategory.id))
				.returning();
			return deletedSubcategory;
		});

		return right({
			message: "Subcategory successfully deleted",
			deleted: {
				...deletedData,
				category: existingSubcategory.category,
			},
		});
	} catch (error) {
		return left(serviceHandleError(error, "deleteSubcategory"));
	}
}
