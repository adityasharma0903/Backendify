import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Messages, MessagesSchema } from '../schemas/messages.entity';
import { MessagesService } from '../services/messages.service';
import { MessagesController } from '../controllers/messages.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Messages.name, schema: MessagesSchema }])],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService]
})
export class MessagesModule {}
