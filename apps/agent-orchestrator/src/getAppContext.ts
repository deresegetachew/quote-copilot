import { INestApplicationContext } from '@nestjs/common';

let app: INestApplicationContext;

export function setAppContext(context: INestApplicationContext) {
  app = context;
}

export function getAppContext(): INestApplicationContext {
  if (!app) throw new Error('App context not initialized!');
  return app;
}
