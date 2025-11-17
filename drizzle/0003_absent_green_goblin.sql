ALTER TABLE `solicitacoesParceria` MODIFY COLUMN `categoria` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `solicitacoesParceria` ADD `tipoCredenciado` enum('medico','instituicao') DEFAULT 'instituicao' NOT NULL;--> statement-breakpoint
ALTER TABLE `solicitacoesParceria` ADD `especialidade` varchar(255);--> statement-breakpoint
ALTER TABLE `solicitacoesParceria` ADD `areaAtuacao` varchar(255);