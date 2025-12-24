CREATE TABLE `webhookLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`evento` varchar(100) NOT NULL,
	`payload` text NOT NULL,
	`statusCode` int,
	`responseBody` text,
	`erro` text,
	`tentativa` int NOT NULL DEFAULT 1,
	`sucesso` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhookLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiKeyId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`eventos` text NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`secret` varchar(64),
	`maxRetries` int NOT NULL DEFAULT 3,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
