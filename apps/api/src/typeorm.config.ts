import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

config();

const configService = new ConfigService();

const ssl_content =
  configService.get('POSTGRES_SSL_ENABLED') === 'true'
    ? {
        ca: fs.readFileSync('eu-central-1-bundle.pem').toString(),
      }
    : false;

export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_PORT'),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DATABASE'),
  ssl: ssl_content,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
});
