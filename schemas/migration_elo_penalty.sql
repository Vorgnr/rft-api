
ALTER TABLE rftdb.match ADD COLUMN `player1_elo_penalty` INT NULL;
ALTER TABLE rftdb.match ADD COLUMN `player2_elo_penalty` INT NULL;
ALTER TABLE rftdb.match ADD COLUMN `comment` VARCHAR(255) NULL;