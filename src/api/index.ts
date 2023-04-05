import express, { Express } from 'express';

import SoundBot from '~/bot/SoundBot';
import { getSounds } from '~/util/SoundUtil';

class Api {
  public http: Express = express();
  public soundBot: SoundBot;

  constructor(soundBot: SoundBot) {
    this.soundBot = soundBot;
    this.routes();
  }

  private routes() {
    this.http.get('/', (req, res) => {
      res.send('1337');
    });

    this.http.get('/sounds', (req, res) => {
      res.json(getSounds());
    });

    this.http.get('/sounds/play/:soundName', (req, res) => {
      this.soundBot.playSound(req.params.soundName).then(() => {
        res.send(req.params.soundName);
      });
    });
  }

  public start() {
    this.http.listen(8080, () => {
      console.info('Server is listening on port 8080');
    });
  }
}

export = Api;
