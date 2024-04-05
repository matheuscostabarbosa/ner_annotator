import { Component } from '@angular/core';
import { LanguageSelectorComponent } from "../language-selector/language-selector.component";
import { CommonModule } from '@angular/common';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [LanguageSelectorComponent, CommonModule, FontAwesomeModule]
})
export class HeaderComponent {
    selectedLanguage: string = 'en'; 
    instructionsContent: string = '';
    instagramIcon = faInstagram;
    envelopeIcon = faEnvelope;

    onLanguageChange(language: string) {
        this.selectedLanguage = language;
    }

    onInstructionsChange(content: string) {
      this.instructionsContent = content; 
    }
}
