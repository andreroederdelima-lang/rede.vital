ALTER TABLE `instituicoes` MODIFY COLUMN `categoria` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `instituicoes` ADD `subcategoria` varchar(100);