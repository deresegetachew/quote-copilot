import { INestApplicationContext } from '@nestjs/common';

export class AppContext {
  private static app: INestApplicationContext;

  static set(context: INestApplicationContext) {
    AppContext.app = context;
  }

  static get(): INestApplicationContext {
    if (!AppContext.app) throw new Error('App context not initialized!');
    return AppContext.app;
  }
}
