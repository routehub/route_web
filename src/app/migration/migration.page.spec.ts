import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrationPage } from './migration.page';

describe('MigrationPage', () => {
  let component: MigrationPage;
  let fixture: ComponentFixture<MigrationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MigrationPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigrationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
