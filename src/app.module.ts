import { HttpException, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatModule } from './cat/cat.module';
import { AllExceptionFilter } from './shared/exception.filter';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { MongooseModule } from '@nestjs/mongoose';
import { isProduction, uri } from './database/database.provider';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { BoardModule } from './board/board.module';
import { RedisModule } from 'nestjs-redis';
import { REDIS_OPTIONS } from './database/redis/redis.options';
import { FileModule } from './file/file.module';
import { RavenInterceptor } from 'nest-raven';
import { UnsplashModule } from './external/unsplash/unsplash.module';
import { ListsModule } from './lists/lists.module';
import { DeviceModule } from './device/device.module';
import { BullModule } from '@nestjs/bull';
import { CardModule } from './card/card.module';
// import { AppGateway } from './app.gateway';

export const redisHost = isProduction ? 'trello-nest-stack_redis' : 'redis';

@Module({
  imports: [
    RedisModule.register(REDIS_OPTIONS),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    }),
    MongooseModule.forRoot(uri),
    CatModule,
    AuthModule,
    WorkspaceModule,
    UsersModule,
    BoardModule,
    FileModule,
    UnsplashModule,
    ListsModule,
    DeviceModule,
    CardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        filters: [
          {
            type: HttpException,
            filter: (exception: HttpException) => 500 > exception.getStatus(),
          },
        ],
      }),
    },
    // AppGateway,
  ],
})
export class AppModule {}
