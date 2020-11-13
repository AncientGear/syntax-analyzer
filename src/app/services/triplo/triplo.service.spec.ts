import { TestBed } from '@angular/core/testing';

import { TriploService } from './triplo.service';

describe('TriploService', () => {
  let service: TriploService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TriploService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
