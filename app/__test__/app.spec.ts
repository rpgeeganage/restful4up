// import * as fs from 'fs';
import * as path from 'path';
import { Server } from 'http';

import * as supertest from 'supertest';

import { getPackedExec, getUnPackedExec } from './fixtures';

import { app } from '../lib';

describe('Restfull4Up', () => {
  let server: Server;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    const specFile = path.join(__dirname, '..', 'spec', 'api.yml');

    const appInstance = await app.getApp(specFile);
    server = appInstance.listen();

    request = supertest.agent(server);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Unpack', () => {
    it('shoudl unpack the given executable', (done) => {
      return request
        .post('/v1/unpack')
        .attach('file', getPackedExec())
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.text).toEqual(getUnPackedExec().toString());

          done();
        });
    });
  });

  describe('Clean', () => {
    it('should clean the workspace', () => {
      return request
        .head('/v1/clean')
        .set('Accept', 'application/json')
        .expect(204);
    });
  });
});
