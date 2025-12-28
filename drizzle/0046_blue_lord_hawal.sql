CREATE TABLE `procedimentosInstituicao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instituicaoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`valorParticular` decimal(10,2),
	`valorAssinante` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `procedimentosInstituicao_id` PRIMARY KEY(`id`)
);
