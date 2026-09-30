import { Module } from '@nestjs/common';
import { UmrahService } from './umrah.service.js';
import { UmrahController } from './umrah.controller.js';

@Module({
  controllers: [UmrahController],
  providers: [UmrahService],
})
export class UmrahModule {}
