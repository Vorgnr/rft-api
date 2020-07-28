
ALTER TABLE rftdb.player ADD COLUMN password_recover_request VARCHAR(36) NULL;
CREATE INDEX player_search_password_recover_request ON rftdb.player (password_recover_request) using btree;