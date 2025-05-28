import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CoreServiceApplicationModule } from '../src/application/coreServiceApplication.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreServiceApplicationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
});
