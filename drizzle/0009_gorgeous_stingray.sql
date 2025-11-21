CREATE TABLE `comissoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`indicacaoId` int NOT NULL,
	`indicadorId` int NOT NULL,
	`valor` int NOT NULL,
	`status` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
	`dataPagamento` timestamp,
	`comprovante` varchar(500),
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comissoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `indicacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`indicadorId` int NOT NULL,
	`nomeCliente` varchar(255) NOT NULL,
	`emailCliente` varchar(320),
	`telefoneCliente` varchar(20) NOT NULL,
	`cidadeCliente` varchar(100),
	`observacoes` text,
	`status` enum('pendente','contatado','em_negociacao','fechado','perdido') NOT NULL DEFAULT 'pendente',
	`vendedorId` int,
	`valorVenda` int,
	`valorComissao` int,
	`dataPagamento` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `indicacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `indicadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tipo` enum('promotor','vendedor') NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`telefone` varchar(20),
	`cpf` varchar(14),
	`pix` varchar(255),
	`comissaoPercentual` int,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `indicadores_id` PRIMARY KEY(`id`)
);
