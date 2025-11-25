ALTER TABLE `solicitacoesParceria` ADD `numeroRegistroConselho` varchar(100);--> statement-breakpoint
ALTER TABLE `solicitacoesParceria` ADD `tipoAtendimento` enum('presencial','telemedicina','ambos') DEFAULT 'presencial' NOT NULL;--> statement-breakpoint
ALTER TABLE `solicitacoesParceria` ADD `whatsappSecretaria` varchar(100);--> statement-breakpoint
ALTER TABLE `solicitacoesParceria` ADD `email` varchar(255);--> statement-breakpoint
ALTER TABLE `solicitacoesParceria` ADD `contatoParceria` varchar(255);--> statement-breakpoint
ALTER TABLE `solicitacoesParceria` ADD `whatsappParceria` varchar(100);--> statement-breakpoint
ALTER TABLE `solicitacoesParceria` ADD `observacoes` text;