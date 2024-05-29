import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailattachementComponent } from './mailattachement.component';

describe('MailattachementComponent', () => {
  let component: MailattachementComponent;
  let fixture: ComponentFixture<MailattachementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MailattachementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailattachementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
