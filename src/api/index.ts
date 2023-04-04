import express, { Express } from 'express';

class Api {
  public http: Express = express();

  constructor() {
    this.routes();
  }

  private routes() {
    this.http.get('/', (req, res) => {
      res.send('Rudy :O hapaj dzide 3====>');
    });
  }

  public start() {
    this.http.listen(8080, () => {
      console.info('Server is listening on port 8080');
    });
  }
}

export = Api;
