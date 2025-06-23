import { redis } from "@/infra/db/redis";
import { Queue } from "bullmq";
import type { EmailJob } from "./email-schema";

export class EmailQueueClient {
	private queue: Queue<EmailJob>;

	constructor() {
		this.queue = new Queue<EmailJob>("emails", { connection: redis });
	}

	async addEmailJob(job: EmailJob) {
		return this.queue.add("send", job, {
			attempts: 5,
			backoff: { type: "exponential", delay: 5000 },
		});
	}
}
