ALTER TABLE "user_to_category" DROP CONSTRAINT "user_to_category_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "post" DROP CONSTRAINT "post_author_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_to_category" ADD CONSTRAINT "user_to_category_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;