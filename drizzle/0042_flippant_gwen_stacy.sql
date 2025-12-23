CREATE TABLE `procedimentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instituicaoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`valorParticular` varchar(50),
	`valorAssinanteVital` varchar(50),
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `procedimentos_id` PRIMARY KEY(`id`)
);
