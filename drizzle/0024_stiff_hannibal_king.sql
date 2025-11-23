ALTER TABLE `instituicoes` ADD `dataUltimaAtualizacao` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `medicos` ADD `dataUltimaAtualizacao` timestamp DEFAULT (now());