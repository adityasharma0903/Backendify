import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversations, ConversationsSchema } from '../schemas/conversations.entity';
import { ConversationsService } from '../services/conversations.service';
import { ConversationsController } from '../controllers/conversations.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Conversations.name, schema: ConversationsSchema }])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService]
})
export class ConversationsModule {}
