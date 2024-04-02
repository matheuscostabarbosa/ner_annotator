import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsSelectionComponent } from './tags-selection.component';

describe('TagsSelectionComponent', () => {
  let component: TagsSelectionComponent;
  let fixture: ComponentFixture<TagsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsSelectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TagsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
