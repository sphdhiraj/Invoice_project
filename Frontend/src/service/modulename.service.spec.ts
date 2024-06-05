import { TestBed } from '@angular/core/testing';

import { ModulenameService } from './modulename.service';

describe('ModulenameService', () => {
  let service: ModulenameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModulenameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
