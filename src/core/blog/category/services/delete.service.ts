import type { ICategoryDTO } from "@/core/blog/category/dto";
import type { AppEither } from "@/core/error/app-either.protocols";
import { left, right } from "@/core/error/either";
import {
	ConflictError,
	NotFoundError,
	UnauthorizedError,
	ValidationError,
} from "@/core/error/errors";
import { serviceHandleError } from "@/core/error/handlers";
import { db } from "@/infra/db";
import { category, post, subcategory } from "@/infra/db/schemas/blog";
import { extractAndValidatePathParams } from "@/infra/helpers/params";
import { auth } from "@/infra/lib/better-auth/auth";
import { zod } from "@/infra/lib/zod";
import { eq, inArray } from "drizzle-orm";

const pathParamSchema = zod.object({
	id: zod.uuid("Invalid category ID"),
});

export async function deleteCategory(
	request: Request,
): Promise<AppEither<{ message: string; deleted: ICategoryDTO }>> {
	try {
		const canAccess = await auth.api.hasPermission({
			headers: request.headers,
			body: {
				permissions: {
					category: ["delete"],
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
					parsedParam.error.issues
						.map((e: { message: any }) => e.message)
						.join("; "),
				),
			);
		}
		const { id } = parsedParam.data;

		const existingCategory = await db.query.category.findFirst({
			where: eq(category.id, id),
		});

		if (!existingCategory) {
			return left(new NotFoundError("Category not found"));
		}

		const subcategories = await db.query.subcategory.findMany({
			where: eq(subcategory.categoryId, id),
		});
		const subcategoryIds = subcategories.map((sc) => sc.id);
		const existingPosts = await db.query.post.findMany({
			where:
				subcategoryIds.length > 0
					? inArray(post.subcategoryId, subcategoryIds)
					: undefined,
		});

		if (existingPosts.length > 0) {
			return left(
				new ConflictError(
					`Category cannot be deleted because it has associated posts. Post amounts: ${existingPosts.length}`,
				),
			);
		}

		const dataDeleted = await db.transaction(async (tx) => {
			const [deletedCategory] = await db
				.delete(category)
				.where(eq(category.id, id))
				.returning();

			return deletedCategory;
		});

		return right({
			message: "Category successfully deleted",
			deleted: dataDeleted,
		});
	} catch (error) {
		return left(serviceHandleError(error, "deleteCategory"));
	}
}
