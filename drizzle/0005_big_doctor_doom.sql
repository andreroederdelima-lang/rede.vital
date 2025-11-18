CREATE TABLE `usuariosAutorizados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usuariosAutorizados_id` PRIMARY KEY(`id`),
	CONSTRAINT `usuariosAutorizados_email_unique` UNIQUE(`email`)
);
