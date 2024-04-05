import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss'
})
export class LanguageSelectorComponent {
  selectedLanguage: string = 'en'; // Default language
  @Output() languageChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() instructionsChange: EventEmitter<string> = new EventEmitter<string>();

  onLanguageChange() {
    if (this.selectedLanguage === 'en') {
      this.loadInstructions('assets/instructions_en.txt');
    } else if (this.selectedLanguage === 'pt') {
      this.loadInstructions('assets/instructions_pt.txt');
    }
  }

  ngOnInit() {
    this.onLanguageChange();
  }

  async loadInstructions(filePath: string) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Failed to load file');
      }
      const content = await response.text();
      this.formatAndEmitInstructions(content); 
    } catch (error) {
      console.error('Error loading file:', error);
    }
  }

  formatAndEmitInstructions(content: string) {
    // Format the content here if necessary, for example, you can split the content by newline characters
    const formattedContent = content.split('\n').map(line => `<p>${line}</p>`).join('');
    this.instructionsChange.emit(formattedContent);
  }
}
