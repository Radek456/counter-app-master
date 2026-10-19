import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { PublicHoliday } from '../models/public-holiday';

@Injectable({
  providedIn: 'root',
})
export class HolidayApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://openholidaysapi.org/PublicHolidays';

  async getHolidays(validFrom: string, validTo: string): Promise<PublicHoliday[]> {
    // firstValueFrom spustí požadavek a umožní počkat na odpověď pomocí await.
    const holidays = await firstValueFrom(
      // Typ popisuje očekávaný JSON, ale nekontroluje jeho obsah za běhu.
      this.http.get<PublicHoliday[]>(this.apiUrl, {
        // HttpClient připojí tyto parametry za otazník v URL.
        params: {
          countryIsoCode: 'CZ',
          languageIsoCode: 'CS',
          validFrom,
          validTo,
        },
      }).pipe(timeout(10000)), // Po 10 sekundách bez odpovědi vyvolá chybu.
    );

    // U YYYY-MM-DD odpovídá pořadí řetězců pořadí dat: nejbližší bude první.
    return holidays.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }
}