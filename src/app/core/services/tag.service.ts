import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  tags: { name: string, color: string }[] = [];
  tagsPerDocument: { [key: number]: { tag: string, start: number, end: number }[] } = {};

  constructor() { }

  addTag(tag: string) {
    const color = this.getRandomColor();
    this.tags.push({ name: tag, color: color });
  }

  addTagToDocument(documentIndex: number, tag: string, start: number, end: number) {
    if (!this.tagsPerDocument[documentIndex]) {
      this.tagsPerDocument[documentIndex] = [];
    }
    this.tagsPerDocument[documentIndex].push({ tag, start, end });
  }

  getTags() {
    return this.tags;
  }

  getTagsForDocument(documentIndex: number) {
    return this.tagsPerDocument[documentIndex] || [];
  }

  private getRandomColor(): string {
    const existingColors = this.tags.map(tag => tag.color);
    let color;
    do {
        // Gere uma cor aleatória em hexadecimal com 6 dígitos
        color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    } while (existingColors.includes(color) || this.isTooDark(color));
    return color;
}

  private isTooDark(color: string): boolean {
      // Converta a cor hexadecimal em RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      // Use uma fórmula de luminância para verificar se a cor é muito escura
      // Essa fórmula dá uma ponderação maior para o canal verde
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Defina um limite de luminância para considerar a cor muito escura
      const darkThreshold = 0.3;

      return luminance < darkThreshold;
  }
}
