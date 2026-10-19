import { TestBed } from '@angular/core/testing';
import { HolidayApiService } from './holiday-api.service';

describe('HolidayApiService', () => {
  let service: HolidayApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HolidayApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
