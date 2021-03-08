import * as path from 'path';

import { app } from './lib';

(async () => {
  const serverApp = await app.getApp(path.join(__dirname, 'spec', 'api.yml'));

  serverApp.listen(process.env.HTTP_PORT, () => {
    console.log(`RESTful4Up started in port ${process.env.HTTP_PORT}`);
  });
})();
