import express from 'express';
import SecretSantaDatabase from './SecretSantaDatabase';

class SecretSantaAPI {

    private app: express.Application;
    private port: number;
    private database: SecretSantaDatabase;

    constructor(port: number) {
        this.port = port;
        this.app = express();
        this.app.use(express.json());

        this.database = new SecretSantaDatabase('../database/secretsanta.db');
        this.database.dropTables();
        this.database.createTables();

        this.database.setTemplateData();

        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.get('/', (req, res) => {
            res.send('Hello World!');
        });

        // GET /api/games - Get all games
        this.app.get('/api/games', async (req, res) => {
            let games = await this.database.getAllGames();
            res.json(games);
        });

        // POST /api/games/ - Create a new game
        this.app.post('/api/games', async (req, res) => {
            let game = await this.database.createGame(req.body.name, req.body.password)
            res.json({message: 'Game created', gameID: game.id, ownerKey: game.ownerKey});
        });

        // GET /api/games/:gameID - Get a game by ID
        this.app.get('/api/games/:gameID', async (req, res) => {
            let game = await this.database.getGameByID(Number(req.params.gameID));
            res.json(game);
        });

        // DELETE /api/games/:gameID - Delete a game by ID
        this.app.delete('/api/games/:gameID', async (req, res) => {
            let valid = await this.database.validateOwnerKey(Number(req.params.gameID), req.body.ownerKey);
            if (!valid) res.status(401).json({message: 'Invalid owner key'});
            await this.database.deleteGame(Number(req.params.gameID));
            res.json({message: 'Game deleted'});
        });

        // POST /api/games/:gameID/players - Add a player to a game
        this.app.post('/api/games/:gameID/players', async (req, res) => {
            let valid = await this.database.validatePassword(Number(req.params.gameID), req.body.password);
            if (!valid) res.status(401).json({message: 'Invalid password'});
            let player = await this.database.createPlayer(req.body.name, req.body.email, Number(req.params.gameID));
            res.json({message: 'Player created', playerID: player});
        });

        // GET /api/games/:gameID/players - Get all players in a game
        this.app.get('/api/games/:gameID/players', async (req, res) => {
            let players = await this.database.getPlayersInGame(Number(req.params.gameID));
            res.json(players);
        });

        // DELETE /api/games/:gameID/players/:playerID - Remove a player from a game
        this.app.delete('/api/games/:gameID/players/:playerID', async (req, res) => {
            let valid = await this.database.validateOwnerKey(Number(req.params.gameID), req.body.ownerKey);
            if (!valid) res.status(401).json({message: 'Invalid owner key'});
            await this.database.deletePlayer(Number(req.params.playerID));
            res.json({message: 'Player deleted'});
        });

        // POST /api/games/:gameID/generate - Generate a secret santa list for a game
        this.app.post('/api/games/:gameID/generate', async (req, res) => {
            let valid = await this.database.validateOwnerKey(Number(req.params.gameID), req.body.ownerKey);
            if (!valid) res.status(401).json({message: 'Invalid owner key'});
            let result = await this.generateSecretSantaList(Number(req.params.gameID));

            this.database.deletePlayersByGameID(Number(req.params.gameID));
            this.database.deleteGame(Number(req.params.gameID));

            res.json(result);
        });
    }

    public async generateSecretSantaList(gameID: number) {
        let players = await this.database.getPlayersInGame(gameID);
        if (players.length < 3) throw new Error('Not enough players');
        if (players.length % 2 != 0) throw new Error('Odd number of players');

        players.sort(() => Math.random() - 0.5); // randomize the order of the players

        let pairs : {giver: any, receiver: any}[] = [];

        for (let i = 0; i < players.length; i++) {
            let pair = {
                giver: -1,
                receiver: -1
            };
            if (i+1 < players.length) {
                pair.giver = players[i];
                pair.receiver = players[i+1];
            } else {
                pair.giver = players[i];
                pair.receiver = players[0];
            }
            pairs.push(pair);
        }

        return pairs;
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }
}

const api = new SecretSantaAPI(3000);
api.start();