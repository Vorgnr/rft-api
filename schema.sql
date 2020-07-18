-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema rftdb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema rftdb
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `rftdb`;
CREATE SCHEMA IF NOT EXISTS `rftdb` DEFAULT CHARACTER SET utf8 ;
USE `rftdb` ;


-- -----------------------------------------------------
-- Table `rftdb`.`player`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `rftdb`.`player` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(45) NULL,
  `avatar` VARCHAR(45) NULL,
  `status` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `password` VARCHAR(45) NULL,
  `main_character` VARCHAR(45) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `rftdb`.`league`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `rftdb`.`league` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(45) NULL,
  `is_active` BOOLEAN DEFAULT 1,
  `starting_elo` INT NOT NULL DEFAULT 0,
  `winning_base_elo` INT NOT NULL DEFAULT 0,
  `losing_base_elo` INT NOT NULL DEFAULT 0,
  `ragequit_penalty` INT NOT NULL DEFAULT 0,
  `rank_treshold` INT NOT NULL DEFAULT 1,
  `rank_diff_ratio` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `rftdb`.`elo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `rftdb`.`elo` (
  `id` VARCHAR(36) NOT NULL,
  `value` INT NULL,
  `played_matches` INT DEFAULT 0,
  `league_id` VARCHAR(36) NOT NULL,
  `player_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`, `league_id`, `player_id`),
  INDEX `fk_elo_league_idx` (`league_id` ASC) VISIBLE,
  INDEX `fk_elo_player1_idx` (`player_id` ASC) VISIBLE,
  CONSTRAINT `fk_elo_league`
    FOREIGN KEY (`league_id`)
    REFERENCES `rftdb`.`league` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_elo_player1`
    FOREIGN KEY (`player_id`)
    REFERENCES `rftdb`.`player` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `rftdb`.`match`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `rftdb`.`match` (
  `id` VARCHAR(36) NOT NULL,
  `character1` VARCHAR(45) NULL,
  `character2` VARCHAR(45) NULL,
  `ft` INT NULL,
  `status` VARCHAR(45) NULL,
  `league_id` VARCHAR(36) NOT NULL,
  `player1_id` VARCHAR(36) NOT NULL,
  `player2_id` VARCHAR(36) NOT NULL,
  `player1_elo` INT NULL,
  `player2_elo` INT NULL,
  `player1_previous_elo` INT NULL,
  `player2_previous_elo` INT NULL,
  `player1_score` INT NULL,
  `player2_score` INT NULL,
  `player1_ragequit` BOOLEAN DEFAULT FALSE,
  `player2_ragequit` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  PRIMARY KEY (`id`, `league_id`, `player1_id`, `player2_id`),
  INDEX `fk_match_league1_idx` (`league_id` ASC) VISIBLE,
  INDEX `fk_match_player1_idx` (`player1_id` ASC) VISIBLE,
  INDEX `fk_match_player2_idx` (`player2_id` ASC) VISIBLE,
  CONSTRAINT `fk_match_league1`
    FOREIGN KEY (`league_id`)
    REFERENCES `rftdb`.`league` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_match_player1`
    FOREIGN KEY (`player1_id`)
    REFERENCES `rftdb`.`player` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_match_player2`
    FOREIGN KEY (`player2_id`)
    REFERENCES `rftdb`.`player` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
