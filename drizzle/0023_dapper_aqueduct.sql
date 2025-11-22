CREATE TABLE `aceitesTermos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`solicitacaoParceriaId` int,
	`termoUsoId` int NOT NULL,
	`tipoTermo` enum('plataforma','prestadores_saude') NOT NULL,
	`versaoTermo` varchar(20) NOT NULL,
	`ipAceite` varchar(45),
	`userAgent` text,
	`dataAceite` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aceitesTermos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `termosUso` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('plataforma','prestadores_saude') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`versao` varchar(20) NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `termosUso_id` PRIMARY KEY(`id`)
);
