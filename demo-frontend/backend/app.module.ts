import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Auto-generated modules
import { ConversationsModule } from './modules/conversations.module';
import { MessagesModule } from './modules/messages.module';
import { ProductsModule } from './modules/products.module';
import { UsersModule } from './modules/users.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/backendify'),
    ConversationsModule,
    MessagesModule,
    ProductsModule,
    UsersModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}