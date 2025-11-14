CREATE TABLE `instituicoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`categoria` enum('clinica','farmacia','laboratorio','academia','hospital','outro') NOT NULL,
	`municipio` varchar(100) NOT NULL,
	`endereco` text NOT NULL,
	`telefone` varchar(100),
	`email` varchar(255),
	`descontoPercentual` int NOT NULL DEFAULT 0,
	`observacoes` text,
	`contatoParceria` varchar(255),
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instituicoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medicos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`especialidade` varchar(255) NOT NULL,
	`subespecialidade` varchar(255),
	`municipio` varchar(100) NOT NULL,
	`endereco` text NOT NULL,
	`telefone` varchar(100),
	`whatsapp` varchar(100),
	`tipoAtendimento` enum('presencial','telemedicina','ambos') NOT NULL DEFAULT 'presencial',
	`descontoPercentual` int NOT NULL DEFAULT 0,
	`observacoes` text,
	`contatoParceria` varchar(255),
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicos_id` PRIMARY KEY(`id`)
);
