import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { TagService } from '../../core/services/tag.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-tags-selection',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule,],
  templateUrl: './tags-selection.component.html',
  styleUrl: './tags-selection.component.scss'
})
export class TagsSelectionComponent {
  //@Output() selectedTag = new EventEmitter<string>(); 

  constructor(
    public tagService: TagService, 
    private dialogRef: MatDialogRef<TagsSelectionComponent>,
    private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.elementRef.nativeElement.focus();
  }

  selectTag(tag: string) {
    this.dialogRef.close(tag);
  }
}
