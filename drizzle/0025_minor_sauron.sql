CREATE TABLE `materiaisDivulgacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('link','arquivo','audio','texto') NOT NULL,
	`categoria` varchar(100) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`conteudo` text,
	`ordem` int DEFAULT 0,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `materiaisDivulgacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templatesWhatsapp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` enum('cliente','parceiro','comercial') NOT NULL,
	`mensagem` text NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templatesWhatsapp_id` PRIMARY KEY(`id`)
);
