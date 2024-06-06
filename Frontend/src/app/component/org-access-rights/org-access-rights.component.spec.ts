import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgAccessRightsComponent } from './org-access-rights.component';

describe('OrgAccessRightsComponent', () => {
  let component: OrgAccessRightsComponent;
  let fixture: ComponentFixture<OrgAccessRightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgAccessRightsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgAccessRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
