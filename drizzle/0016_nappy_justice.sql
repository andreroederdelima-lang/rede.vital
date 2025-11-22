CREATE TABLE `configuracoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chave` varchar(100) NOT NULL,
	`valor` text NOT NULL,
	`descricao` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` varchar(255),
	CONSTRAINT `configuracoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `configuracoes_chave_unique` UNIQUE(`chave`)
);
