import { TestBed } from '@angular/core/testing';

import { SemanticErrorsService } from './semantic-errors.service';

describe('SemanticErrorsService', () => {
  let service: SemanticErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SemanticErrorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
