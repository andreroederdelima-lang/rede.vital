CREATE TABLE `solicitacoesAtualizacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoCredenciado` enum('medico','instituicao') NOT NULL,
	`credenciadoId` int NOT NULL,
	`telefone` varchar(100),
	`whatsapp` varchar(100),
	`email` varchar(255),
	`endereco` text,
	`precoConsulta` varchar(50),
	`descontoPercentual` int,
	`observacoes` text,
	`status` enum('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
	`motivoRejeicao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `solicitacoesAtualizacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `instituicoes` ADD `tokenAtualizacao` varchar(64);--> statement-breakpoint
ALTER TABLE `medicos` ADD `tokenAtualizacao` varchar(64);--> statement-breakpoint
ALTER TABLE `instituicoes` ADD CONSTRAINT `instituicoes_tokenAtualizacao_unique` UNIQUE(`tokenAtualizacao`);--> statement-breakpoint
ALTER TABLE `medicos` ADD CONSTRAINT `medicos_tokenAtualizacao_unique` UNIQUE(`tokenAtualizacao`);