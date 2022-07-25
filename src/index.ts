import express, { Express } from 'express';
require('express-async-errors');
import session from 'express-session';
import path from 'node:path';
import multer from 'multer'
import { tables } from './tables';
import bodyParser from 'body-parser'
import { sessionStore } from './dependencies/session';
import { pageRouter } from './pages';
import { actionsRouter } from './actions';
import { registerAuth } from './dependencies/authn';
import { subscribeAll } from './dependencies/eventStore';

import { uploadedGedcom } from './actions/uploaderGedcom'

const PORT: number = parseInt(process.env.PORT ?? '3000');

const app: Express = express();

app.use(
  express.urlencoded({
    extended: false,
    limit: '10mb',
  })
);
app.use(express.json({ limit: '10mb' }));

app.get('/ping', (_: express.Request, response: express.Response): void => {
  response.send('pong');
});

app.use(
  session({
    secret: 'super-secret',
    store: sessionStore,
    resave: false,
    proxy: true,
    saveUninitialized: false,
  })
);

registerAuth(app);

app.use(pageRouter);
app.use(actionsRouter);

app.use(express.static(path.join(__dirname, 'assets')));

app.listen(PORT, (): void => {
  // eslint-disable-next-line no-console
  console.log('Server listening to port', PORT);

  subscribeAll(async (event) => {
    for (const projectionTable of tables) {
      await projectionTable.handleEvent(event);
    }
  });
});

const FILE_SIZE_LIMIT_MB = 50

const upload = multer({
  dest: 'temp',
  limits: { fileSize: FILE_SIZE_LIMIT_MB * 1024 * 1024 /* MB */ },
})

app.post(
  '/importGedcom.html',
  bodyParser.urlencoded({
    extended: false,
    limit: '10mb',
  }),
  upload.single('fichier'),
   uploadedGedcom
)
