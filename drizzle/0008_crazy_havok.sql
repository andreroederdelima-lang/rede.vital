CREATE TABLE `solicitacoesAcesso` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`telefone` varchar(100),
	`justificativa` text NOT NULL,
	`status` enum('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
	`motivoRejeicao` text,
	`senhaTemporaria` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `solicitacoesAcesso_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokensRecuperacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usado` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokensRecuperacao_id` PRIMARY KEY(`id`),
	CONSTRAINT `tokensRecuperacao_token_unique` UNIQUE(`token`)
);
