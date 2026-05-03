import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NouvelleCommande } from './nouvelle-commande';

describe('NouvelleCommande', () => {
  let component: NouvelleCommande;
  let fixture: ComponentFixture<NouvelleCommande>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NouvelleCommande],
    }).compileComponents();

    fixture = TestBed.createComponent(NouvelleCommande);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
