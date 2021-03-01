import * as path from 'path';

import * as lib from './lib';

(async () => {
  const app = await lib.app.getApp(path.join(__dirname, 'spec', 'api.yml'));

  app.listen(process.env.HTTP_PORT, () => {
    console.log(`RESTful4Up started in port ${process.env.HTTP_PORT}`);
  });
})();
