import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));
  
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);
  
  const io = new Server(app.getHttpServer(), {
    cors: { origin: process.env.CORS_ORIGIN || '*' }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('message:send', (data) => {
      io.emit('message:new', data);
    });

    socket.on('user:typing', (data) => {
      socket.broadcast.emit('user:typing', data);
    });

    socket.on('user:stopped-typing', (data) => {
      socket.broadcast.emit('user:stopped-typing', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  console.log(`🚀 NestJS server running on http://localhost:${PORT}`);
}

bootstrap();