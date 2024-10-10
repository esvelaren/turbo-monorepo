import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import { config } from 'dotenv';
config();

console.log('Database Configuration:');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
console.log('POSTGRES_DATABASE:', process.env.POSTGRES_DATABASE);
console.log('POSTGRES_SSL_ENABLED:', process.env.POSTGRES_SSL_ENABLED);

// Check if the SSL certificate is in the correct location
const sslEnabled = process.env.POSTGRES_SSL_ENABLED === 'true';
const sslCertificatePath = join(__dirname, '..', 'eu-central-1-bundle.pem');
if (!fs.existsSync(sslCertificatePath)) {
  console.error('SSL certificate not found at', sslCertificatePath);
  process.exit(1);
}
console.log('SSL certificate found at', sslCertificatePath);
const ssl_content = sslEnabled
  ? {
      ca: fs.readFileSync(sslCertificatePath).toString(),
      rejectUnauthorized: true,
    }
  : false;

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'client', 'dist'),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [],
      ssl: ssl_content,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.dataSource.query('SELECT 1');
      console.log('Database connection is successful');
    } catch (error) {
      console.error('Database connection failed', error);
    }
  }
}
