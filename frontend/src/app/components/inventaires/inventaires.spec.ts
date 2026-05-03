import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inventaires } from './inventaires';

describe('Inventaires', () => {
  let component: Inventaires;
  let fixture: ComponentFixture<Inventaires>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inventaires],
    }).compileComponents();

    fixture = TestBed.createComponent(Inventaires);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
