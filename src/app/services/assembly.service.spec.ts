import { TestBed } from '@angular/core/testing';

import { AssemblyService } from './assembly.service';

describe('AssemblyService', () => {
  let service: AssemblyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssemblyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
