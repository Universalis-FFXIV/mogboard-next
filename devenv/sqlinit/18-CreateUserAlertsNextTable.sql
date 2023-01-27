USE `dalamud`;
CREATE TABLE `users_alerts_next` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) DEFAULT NULL,
  `item_id` INT NOT NULL,
  `world_id` INT NOT NULL,
  `discord_webhook` TEXT DEFAULT NULL,
  `trigger_version` INT NOT NULL,
  `trigger` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY (`item_id`, `world_id`, `trigger_version`),
  CONSTRAINT `FK_user_id_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;