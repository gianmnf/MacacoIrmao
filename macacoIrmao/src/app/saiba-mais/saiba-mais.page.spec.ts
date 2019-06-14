import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaibaMaisPage } from './saiba-mais.page';

describe('SaibaMaisPage', () => {
  let component: SaibaMaisPage;
  let fixture: ComponentFixture<SaibaMaisPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaibaMaisPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaibaMaisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
