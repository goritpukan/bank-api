import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [DepositController],
  providers: [DepositService],
  imports: [UserModule],
})
export class DepositModule {}
