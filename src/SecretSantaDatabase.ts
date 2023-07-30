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

    public async createGame(name: string, password?: string): Promise<{ id: number, ownerKey: string }> {
        return new Promise((resolve, reject) => {
            let ownerKey = this.generateOwnerKey(10, 20);
            if (!password) {
                password = '';
            }
            this.db.run('INSERT INTO games (name, owner_key, password) VALUES (?, ?, ?)', [name, ownerKey, password], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ownerKey: ownerKey });
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

    public async getPlayersInGame(gameID: number): Promise<any[]> {
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

    public async validateOwnerKey(gameID: number, ownerKey: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM games WHERE id = ? AND owner_key = ?', [gameID, ownerKey], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            });
        });
    }

    public async validatePassword(gameID: number, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM games WHERE id = ? AND password = ?', [gameID, password], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            });
        });
    }

    public async setTemplateData(){
        // Create game 
        let game = await this.createGame('Test Game');
        
        // Create players
        let player1 = await this.createPlayer('Player 1', 'pl1@example.com', game.id);
        let player2 = await this.createPlayer('Player 2', 'pl2@example.com', game.id);
        let player3 = await this.createPlayer('Player 3', 'pl3@example.com', game.id);
        let player4 = await this.createPlayer('Player 4', 'pl4@example.com', game.id);
        let player5 = await this.createPlayer('Player 5', 'pl5@example.com', game.id);
        let player6 = await this.createPlayer('Player 6', 'pl6@example.com', game.id);
    }
}