import express from 'express';

class SecretSantaAPI {

    private app: express.Application;
    private port: number;

    constructor(port: number) {
        this.port = port;
        this.app = express();
        this.app.use(express.json());

        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.get('/', (req, res) => {
            res.send('Hello World!');
        });
    }

    public start() {
        this.app.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }
}

const api = new SecretSantaAPI(3000);
api.start();