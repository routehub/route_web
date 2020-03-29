import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteinfoPage } from './routeinfo.page';

describe('RouteinfoPage', () => {
  let component: RouteinfoPage;
  let fixture: ComponentFixture<RouteinfoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RouteinfoPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteinfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
