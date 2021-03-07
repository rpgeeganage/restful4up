import * as path from 'path';

import debug from 'debug';
import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import * as openApiValidator from 'express-openapi-validator';

import * as controllers from './controllers';
import * as error from './errors';

const debugApp = debug('app');

export async function getApp(
  specFilePath: string
): Promise<express.Application> {
  const app = express();

  app.use(cors());

  app.use(bodyParser.json());
  app.use(bodyParser.text());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use('/spec', express.static(specFilePath));

  app.use(
    openApiValidator.middleware({
      apiSpec: specFilePath,
      validateRequests: true,
      validateResponses: true,
      operationHandlers: {
        basePath: path.join(__dirname),
        resolver: function (
          _cwd: string,
          specArgs: {
            basePath: string;
            openApiRoute: string;
          }
        ) {
          switch (specArgs.openApiRoute) {
            case `${specArgs.basePath}/clean`:
              return controllers.clean;
            case `${specArgs.basePath}/unpack`:
              return controllers.unpack;
            case `${specArgs.basePath}/emulation-output`:
              return controllers.emulationOutput;
            case `${specArgs.basePath}/generate-yara-rules`:
              return controllers.generateYaraRule;
            default:
              throw new Error(`incorrect path ${specArgs.openApiRoute}`);
          }
        }
      }
    })
  );

  app.use(
    (
      err: error.IError,
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      debugApp('Error %o', err);

      res.status(err.status).json({
        status: err.status,
        message: err.message
      });

      next();
    }
  );

  return app;
}
