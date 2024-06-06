import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleNameComponent } from './module-name.component';

describe('ModuleNameComponent', () => {
  let component: ModuleNameComponent;
  let fixture: ComponentFixture<ModuleNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuleNameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
