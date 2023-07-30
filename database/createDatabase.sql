CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY, 
    name TEXT NOT NULL,
    owner_key TEXT NOT NULL,
    password TEXT
);

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY, 
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    game_id INTEGER NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id),
    UNIQUE (game_id, email)
);