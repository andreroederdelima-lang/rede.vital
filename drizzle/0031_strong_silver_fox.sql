CREATE TABLE `avaliacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoCredenciado` enum('medico','instituicao') NOT NULL,
	`credenciadoId` int NOT NULL,
	`nomeCredenciado` varchar(255) NOT NULL,
	`nota` int NOT NULL,
	`comentario` text,
	`nomeAvaliador` varchar(255),
	`emailAvaliador` varchar(320),
	`telefoneAvaliador` varchar(100),
	`aprovada` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `avaliacoes_id` PRIMARY KEY(`id`)
);
