import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./features/header/header.component";
import { FooterComponent } from "./features/footer/footer.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent]
})
export class AppComponent {
  title = 'Named Entity Recognition (NER) - Annotator';
}
