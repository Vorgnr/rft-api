
ALTER TABLE rftdb.match ADD COLUMN is_canceled BOOLEAN DEFAULT 0;
CREATE INDEX match_search_is_canceled ON rftdb.match (is_canceled) using btree;