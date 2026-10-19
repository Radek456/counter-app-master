import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { PublicHoliday } from '../models/public-holiday';
import { daysUntil, localDateIso } from '../models/holiday-date';
import { HolidayApiService } from '../services/holiday-api.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab3Page {
  private readonly holidayApi = inject(HolidayApiService);

  readonly holidays = signal<PublicHoliday[]>([]);
  readonly selectedId = signal('');
  readonly today = signal(localDateIso());
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  // Při změně seznamu nebo vybraného ID znovu najdeme odpovídající svátek.
  readonly selectedHoliday = computed(() =>
    this.holidays().find((holiday) => holiday.id === this.selectedId()),
  );

  // Změna svátku nebo dneška přepočítá odpočet bez nového volání API.
  readonly remainingDays = computed(() => {
    const holiday = this.selectedHoliday();
    // Dokud není vybraný svátek, nemáme z čeho počítat.
    if (!holiday) {
      return null;
    }

    return daysUntil(holiday.startDate, this.today());
  });

  // Ionic tuto metodu zavolá při každém vstupu na záložku.
  async ionViewWillEnter(): Promise<void> {
    await this.loadHolidays();
  }

  holidayName(holiday: PublicHoliday): string {
    // API jsme požádali o češtinu; vezmeme první název.
    // ?. ošetří chybějící položku a ?? doplní náhradní text, pokud text chybí.
    return holiday.name[0]?.text ?? 'Svátek bez názvu';
  }

  async loadHolidays(): Promise<void> {
    // Pokud už požadavek běží, další nespouštíme.
    if (this.loading()) {
      return;
    }

    // Dnešek obnovíme i při návratu na stránku, například po půlnoci.
    const now = new Date();
    const today = localDateIso(now);
    const nextYear = now.getFullYear() + 1;
    this.today.set(today);
    // Zapneme spinner a vymažeme předchozí chybu, data i výběr.
    this.loading.set(true);
    this.errorMessage.set('');
    this.holidays.set([]);
    this.selectedId.set('');

    try {
      // Načteme i příští rok, aby byl co vybírat také na konci prosince.
      const holidays = await this.holidayApi.getHolidays(today, `${nextYear}-12-31`);
      // filter ponechá dnešní a budoucí svátky; datum porovnáváme jako řetězec.
      const upcoming = holidays.filter((holiday) => holiday.startDate >= today);
      this.holidays.set(upcoming);
      // Služba svátky seřadila. První vybereme, jen pokud pole není prázdné.
      const firstHoliday = upcoming[0];
      if (firstHoliday) {
        this.selectedId.set(firstHoliday.id);
      }
    } catch (error) {
      // Podrobnosti patří do konzole, uživateli zobrazíme krátkou zprávu.
      console.error('Svátky se nepodařilo načíst.', error);

      this.errorMessage.set('Svátky se nepodařilo načíst. Zkuste to znovu.');
    } finally {
      // finally se provede po úspěchu i po chybě: vypne spinner a povolí tlačítko.
      this.loading.set(false);
    }
  }
}