import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config';
import { join } from 'path';

interface TRegisterModuleOption {
  configFilePath: string;
}

@Module({})
export class AppConfigModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static forRoot(options?: TRegisterModuleOption): DynamicModule {
    // const configFn = () => config(options.configFilePath);

    const path = join(
      process.cwd(),
      'dist',
      'libs',
      'config',
      'src',
      'local.config.yml',
    );

    console.log('path', path);

    const configFn = () => config(path);

    return {
      module: AppConfigModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true, // this sets it as global module and we don't need to import it in other modules
          ignoreEnvFile: true,
          load: [configFn],
        }),
      ],
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}
