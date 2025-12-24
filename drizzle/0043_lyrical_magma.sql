CREATE TABLE `apiKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`apiKey` varchar(64) NOT NULL,
	`ativa` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp,
	`requestCount` int NOT NULL DEFAULT 0,
	`createdBy` varchar(255),
	CONSTRAINT `apiKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `apiKeys_apiKey_unique` UNIQUE(`apiKey`)
);
--> statement-breakpoint
CREATE TABLE `apiLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiKeyId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`statusCode` int NOT NULL,
	`responseTime` int NOT NULL,
	`queryParams` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiLogs_id` PRIMARY KEY(`id`)
);
