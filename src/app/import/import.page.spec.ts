import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImportPage } from './import.page';

describe('ImportPage', () => {
  let component: ImportPage;
  let fixture: ComponentFixture<ImportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
