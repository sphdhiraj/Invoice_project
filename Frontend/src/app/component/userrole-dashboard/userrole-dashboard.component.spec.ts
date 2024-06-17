import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserroleDashboardComponent } from './userrole-dashboard.component';

describe('UserroleDashboardComponent', () => {
  let component: UserroleDashboardComponent;
  let fixture: ComponentFixture<UserroleDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserroleDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserroleDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
