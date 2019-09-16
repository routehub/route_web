import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacypolicyPage } from './privacypolicy.page';

describe('PrivacypolicyPage', () => {
  let component: PrivacypolicyPage;
  let fixture: ComponentFixture<PrivacypolicyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacypolicyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacypolicyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
