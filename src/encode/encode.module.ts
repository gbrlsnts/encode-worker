import { Module } from '@nestjs/common';
import { EncodeService } from './encode.service';

@Module({
  providers: [EncodeService]
})
export class EncodeModule {}
