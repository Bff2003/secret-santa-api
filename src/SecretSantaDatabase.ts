import sqlite3 from 'sqlite3';
import fs from 'fs';

export default class SecretSantaDatabase {

    private db: sqlite3.Database;

    constructor(filename: string) {
        this.db = new sqlite3.Database(filename);
    }

    public getDatabase() {
        return this.db;
    }

    public dropTables() {
        return new Promise((resolve, reject) => {
            this.db.run('DROP TABLE IF EXISTS games', (err) => {
                if (err) {
                    reject(err);
                } else {
                    this.db.run('DROP TABLE IF EXISTS players', (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(1);
                        }
                    });
                }
            });
        });
    }

    public async createTables() {
        let data = fs.readFileSync('../database/createDatabase.sql');
        let sql = data.toString();
        await this.db.exec(sql);
    }

    public async getGameByID(id: number) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM games WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    public async getAllGames() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM games', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    private generateOwnerKey(minLength: number, maxLength: number) {
        let length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    public async createGame(name: string, password: string) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO games (name, owner_key, password) VALUES (?, ?, ?)', [name, this.generateOwnerKey(10, 20), password], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    public async deleteGame(id: number) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM games WHERE id = ?', [id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(1);
                }
            });
        });
    }

    public async getPlayersByGameID(gameID: number) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM players WHERE game_id = ?', [gameID], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    public async getPlayerByID(id: number) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM players WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    public async getAllPlayers() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM players', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    public async createPlayer(name: string, email: string, gameID: number) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO players (name, email, game_id) VALUES (?, ?, ?)', [name, email, gameID], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    public async deletePlayer(id: number) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM players WHERE id = ?', [id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(1);
                }
            });
        });
    }

    public async deletePlayersByGameID(gameID: number) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM players WHERE game_id = ?', [gameID], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(1);
                }
            });
        });
    }

    public async getPlayersInGame(gameID: number) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM players WHERE game_id = ?', [gameID], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}