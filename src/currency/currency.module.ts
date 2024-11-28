import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
