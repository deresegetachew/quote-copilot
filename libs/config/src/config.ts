import {
  ConfigFactory,
  EnvConfigFactory,
  StaticConfigFactory,
} from './config.factory';
import { TConfiguration } from './config.model';

export default (filePath: string) => {
  const configFactory =
    process.env.NODE_ENV === 'production'
      ? new EnvConfigFactory()
      : new StaticConfigFactory(filePath);

  return new AppConfig(configFactory).config;
};

export class AppConfig {
  public config: TConfiguration;

  constructor(configFactory: ConfigFactory) {
    this.config = configFactory.getConfig();
  }
}
