import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';

type SortOption = 'newest' | 'name' | 'value';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonAlert,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToast,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);
  readonly searchTerm = signal('');
  readonly sortBy = signal<SortOption>('newest');
  readonly clearAlertOpen = signal(false);
  readonly toastMessage = signal('');
  readonly toastOpen = signal(false);
  readonly totalValue = computed(() =>
    this.counterService
      .counters()
      .reduce((sum, counter) => sum + counter.value, 0),
  );
  readonly valueCounts = computed(() =>
    this.counterService.counters().reduce(
      (counts, counter) => {
        if (counter.value > 0) {
          counts.positive++;
        } else if (counter.value < 0) {
          counts.negative++;
        } else {
          counts.zero++;
        }

        return counts;
      },
      { positive: 0, negative: 0, zero: 0 },
    ),
  );
  readonly displayedCounters = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase('cs-CZ');
    const counters = this.counterService
      .counters()
      .filter((counter) =>
        counter.name.toLocaleLowerCase('cs-CZ').includes(query),
      );

    return [...counters].sort((first, second) => {
      switch (this.sortBy()) {
        case 'name':
          return first.name.localeCompare(second.name, 'cs');
        case 'value':
          return second.value - first.value;
        default:
          return (
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
          );
      }
    });
  });
  readonly clearAlertButtons = [
    { text: 'Zrušit', role: 'cancel' },
    {
      text: 'Vymazat',
      role: 'destructive',
      handler: () => {
        void this.confirmClear();
      },
    },
  ];

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
    this.showToast('Záznam byl odstraněn.');
  }

  openClearAlert(): void {
    this.clearAlertOpen.set(true);
  }

  async confirmClear(): Promise<void> {
    this.clearAlertOpen.set(false);
    await this.counterService.clear();
    this.showToast('Historie byla vymazána.');
  }

  onSearch(event: CustomEvent<{ value?: string | null }>): void {
    this.searchTerm.set(event.detail.value ?? '');
  }

  onSortChange(event: CustomEvent<{ value?: SortOption }>): void {
    this.sortBy.set(event.detail.value ?? 'newest');
  }

  exportHistory(): void {
    console.log(
      'Export historie počítadel:',
      JSON.stringify(this.counterService.counters(), null, 2),
    );
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    this.toastOpen.set(true);
  }
}
