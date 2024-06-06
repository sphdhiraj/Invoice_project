import { TestBed } from '@angular/core/testing';

import { OrgAccessRightsService } from './org-access-rights.service';

describe('OrgAccessRightsService', () => {
  let service: OrgAccessRightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgAccessRightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
