import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';

config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule global, so it can be imported by other modules
      envFilePath: './apps/api/.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'client', 'dist'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // print the environment variables
        // console.log(configService.get('POSTGRES_USER'));
        const ssl_content =
          configService.get('POSTGRES_SSL_ENABLED') === 'true'
            ? {
                ca: fs.readFileSync('eu-central-1-bundle.pem').toString(),
              }
            : false;
        return {
          type: 'postgres',
          host: configService.get<string>('POSTGRES_HOST'),
          port: configService.get<number>('POSTGRES_PORT'),
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          ssl: ssl_content,
          synchronize: true,
        };
      },
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
