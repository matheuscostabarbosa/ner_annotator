import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnotadorHomeComponent } from './anotador-home.component';

describe('AnotadorHomeComponent', () => {
  let component: AnotadorHomeComponent;
  let fixture: ComponentFixture<AnotadorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnotadorHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnotadorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
