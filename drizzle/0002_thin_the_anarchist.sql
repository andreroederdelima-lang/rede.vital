CREATE TABLE `solicitacoesParceria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomeResponsavel` varchar(255) NOT NULL,
	`nomeEstabelecimento` varchar(255) NOT NULL,
	`categoria` enum('clinica','farmacia','laboratorio','academia','hospital','outro') NOT NULL,
	`endereco` text NOT NULL,
	`cidade` varchar(100) NOT NULL,
	`telefone` varchar(100) NOT NULL,
	`descontoPercentual` int NOT NULL,
	`imagemUrl` text,
	`status` enum('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
	`motivoRejeicao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `solicitacoesParceria_id` PRIMARY KEY(`id`)
);
