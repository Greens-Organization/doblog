import { redis } from "@/infra/db/redis";
import { logger } from "@/infra/lib/logger/logger-server";
import { Worker } from "bullmq";
import { type EmailJob, EmailJobSchema, EmailSender } from "../lib";

const sender = new EmailSender();

const worker = new Worker<EmailJob>(
	"emails",
	async (job) => {
		const parsed = EmailJobSchema.safeParse(job.data);
		if (!parsed.success) throw new Error("Invalid email job data");
		await sender.send(parsed.data);
	},
	{ connection: redis },
);

worker.on("completed", (job) => {
	logger.log(`Email sent: ${job.id}`);
});

worker.on("failed", (job, err) => {
	logger.error(`Failed to send email ${job?.id}:`, err);
});
