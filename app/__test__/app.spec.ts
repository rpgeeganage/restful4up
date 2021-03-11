// import * as fs from 'fs';
import * as path from 'path';
import { Server } from 'http';

import * as supertest from 'supertest';

import { getPackedExec, getUnPackedExec, getYaraRules } from './fixtures';

import { app, file } from '../lib';

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
    it('should unpack the given executable', (done) => {
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

  describe('Emulation Output', () => {
    it('should return proper emulation output', () => {
      return request
        .post('/v1/emulation-output')
        .set('Accept', 'application/json')
        .attach('file', getPackedExec())
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          expect(response.body.output).toBeInstanceOf(Array);
          expect(response.body.output).not.toEqual([]);
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

  describe('Generate Partial YARA rule', () => {
    function assertBasicRule(yaraRule: file.IYaraRule) {
      expect(yaraRule.name.trim().length).not.toEqual(0);

      const metaAttributes = ['date', 'md5sum', 'sha256sum', 'sha512sum'];
      metaAttributes.forEach((metaAttribute) => {
        expect(yaraRule.meta).toHaveProperty(metaAttribute);
        expect(
          (yaraRule.meta as { [key: string]: string })[metaAttribute].length
        ).not.toEqual(0);
      });

      expect(yaraRule.strings).toBeInstanceOf(Array);
      expect(yaraRule.strings).not.toEqual([]);
    }

    it('should return partial YARA rule', () => {
      return request
        .post('/v1/generate-partial-yara-rules')
        .field({ file: getPackedExec() })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          assertBasicRule(response.body.rule);
        });
    });

    it('should return partial YARA rule with is_unpacking_required as true', () => {
      return request
        .post('/v1/generate-partial-yara-rules')
        .field({ file: getPackedExec(), is_unpacking_required: 'true' })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          assertBasicRule(response.body.rule);
        });
    });

    it('should return partial YARA rule with strings_to_ignore', () => {
      const stringToIgnore = 'This program cannot be run in DOS mode.';

      return request
        .post('/v1/generate-partial-yara-rules')
        .field('file', getPackedExec())
        .field('strings_to_ignore', stringToIgnore)
        .field('strings_to_ignore', '')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          assertBasicRule(response.body.rule);
          (response.body.rule as file.IYaraRule).strings.forEach((element) => {
            expect(element[1]).not.toEqual(stringToIgnore);
          });
        });
    });

    it('should return partial YARA rule with minimum_string_length as 15', () => {
      const miniumStringLength = 15;

      return request
        .post('/v1/generate-partial-yara-rules')
        .field({
          file: getPackedExec(),
          minimum_string_length: miniumStringLength.toString()
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          assertBasicRule(response.body.rule);
          (response.body.rule as file.IYaraRule).strings.forEach((element) => {
            expect(element[1].length).toBeGreaterThanOrEqual(
              miniumStringLength
            );
          });
        });
    });

    it('should return partial YARA rule with all the filters', () => {
      const miniumStringLength = 15;
      const stringToIgnore = 'This program cannot be run in DOS mode.';

      return request
        .post('/v1/generate-partial-yara-rules')
        .field('file', getPackedExec())
        .field('is_unpacking_required', 'true')
        .field('strings_to_ignore', stringToIgnore)
        .field('strings_to_ignore', '')
        .field('minimum_string_length', miniumStringLength.toString())
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          assertBasicRule(response.body.rule);
          (response.body.rule as file.IYaraRule).strings.forEach((element) => {
            expect(element[1].length).toBeGreaterThanOrEqual(
              miniumStringLength
            );
            expect(element[1]).not.toEqual(stringToIgnore);
          });
        });
    });
  });

  describe.only('Apply YARA rule', () => {
    it('Should return proper resutls', () => {
      return request
        .post('/v1/apply-yara-rules')
        .field({
          file: getPackedExec(),
          is_unpacking_required: 'true',
          rules: getYaraRules()
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          console.log(response.body);
        });
    });
  });
});
