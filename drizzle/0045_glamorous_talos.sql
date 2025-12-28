CREATE TABLE `sugestoesParceiros` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomeParceiro` varchar(255) NOT NULL,
	`especialidade` varchar(255) NOT NULL,
	`municipio` varchar(100) NOT NULL,
	`telefone` varchar(100),
	`email` varchar(320),
	`observacoes` text,
	`status` enum('pendente','em_contato','link_enviado','aguardando_cadastro','cadastrado','nao_interessado','retomar_depois') NOT NULL DEFAULT 'pendente',
	`notas` text,
	`ultimoContato` timestamp,
	`responsavel` varchar(255),
	`indicadoPor` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sugestoesParceiros_id` PRIMARY KEY(`id`)
);
