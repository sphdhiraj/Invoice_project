import { TestBed } from '@angular/core/testing';

import { UserAccessRightsService } from './user-access-rights.service';

describe('UserAccessRightsService', () => {
  let service: UserAccessRightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserAccessRightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
