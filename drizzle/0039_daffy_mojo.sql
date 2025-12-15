CREATE TABLE `tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`tipo` enum('atualizacao','cadastro') NOT NULL,
	`tipoCredenciado` enum('medico','instituicao') NOT NULL,
	`credenciadoId` int,
	`email` varchar(320),
	`telefone` varchar(100),
	`usado` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`usadoEm` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` varchar(255),
	CONSTRAINT `tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `tokens_token_unique` UNIQUE(`token`)
);
