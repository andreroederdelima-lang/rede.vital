CREATE TABLE `comissoesAssinaturas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoAssinatura` varchar(100) NOT NULL,
	`nomeExibicao` varchar(100) NOT NULL,
	`precoMensal` int NOT NULL,
	`valorComissaoTotal` int NOT NULL,
	`percentualIndicador` int NOT NULL DEFAULT 70,
	`percentualVendedor` int NOT NULL DEFAULT 30,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` varchar(255),
	CONSTRAINT `comissoesAssinaturas_id` PRIMARY KEY(`id`),
	CONSTRAINT `comissoesAssinaturas_tipoAssinatura_unique` UNIQUE(`tipoAssinatura`)
);
