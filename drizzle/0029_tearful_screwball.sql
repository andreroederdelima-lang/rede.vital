CREATE TABLE `copys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`categoria` enum('planos','promocoes','outros') NOT NULL DEFAULT 'outros',
	`ordem` int NOT NULL DEFAULT 0,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` varchar(255),
	CONSTRAINT `copys_id` PRIMARY KEY(`id`)
);
