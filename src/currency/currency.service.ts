import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import * as process from 'node:process';

@Injectable()
export class CurrencyService {
  constructor(private readonly httpService: HttpService) {}

  async convert(
    baseCurrency: string,
    targetCurrency: string,
    amount: number,
  ): Promise<number> {
    const apiUrl = `https://v6.exchangerate-api.com/v6/${process.env.CURRENCY_API_KEY}/pair/${baseCurrency}/${targetCurrency}`;
    const response = await lastValueFrom(
      this.httpService.get(apiUrl).pipe(map((res) => res.data)),
    );
    return amount * response.conversion_rate;
  }
}
