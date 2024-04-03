import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { TagService } from '../../core/services/tag.service';
import { TagsSelectionComponent } from '../tags-selection/tags-selection.component';

interface CustomFile {
  name: string;
  content: string;
}


interface Tag {
  name: string;
  color: string;
}


interface SelectedTextResult {
  text: string;
  startIndex: number;
  length: number;
}

@Component({
  selector: 'app-anotador-home',
  standalone: true,
  imports: [FormsModule, CommonModule, MatDialogModule],
  templateUrl: './anotador-home.component.html',
  styleUrl: './anotador-home.component.scss'
})
export class AnotadorHomeComponent {
  files: CustomFile[] = [];
  currentFile: CustomFile | null = null;
  currentIndex: number = 0;
  newTag: string = '';

  constructor(
    public tagService: TagService,
    public dialog: MatDialog
  ) {}

  selectFiles(event: any) {
    const fileList: FileList = event.target.files;
    for (let i = 0; i < fileList.length; i++) {
      const file: File = fileList[i];
      if (file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = () => {
          const content: string | ArrayBuffer | null = reader.result;
          if (typeof content === 'string') {
            this.files.push({ name: file.name, content });
          }
        };
        reader.readAsText(file);
      }
    }
  }

  skip() {
    if (this.currentIndex < this.files.length - 1) {
      this.currentIndex++;
      this.currentFile = this.files[this.currentIndex];
    }
  }

  back() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentFile = this.files[this.currentIndex];
    }
  }

  setCurrentFile(file: CustomFile) {
    this.currentFile = file;
    this.currentIndex = this.files.indexOf(file);
  }

  onTextSelect() {
    const textArea = document.querySelector('.custom-textarea');
    if (textArea) {
      const selectedText = this.getSelectedText(textArea);
      console.log("Texto selecionado:", selectedText);
      
      if (selectedText) {
        const dialogRef = this.dialog.open(TagsSelectionComponent);

        dialogRef.afterClosed().subscribe((selectedTag: string) => {
          if (selectedTag) {
            const currentIndex = this.currentIndex;
            console.log(selectedText.startIndex)
            console.log(selectedText.length)
            const end = selectedText.startIndex + selectedText.length;
            const existingTagIndex = this.tagService.getTagsForDocument(currentIndex).findIndex(tag => tag.start === selectedText.startIndex && tag.end === end);

            if (existingTagIndex !== -1) {
              // Se uma tag já existe com o mesmo início e fim, substitua-a
              this.tagService.tagsPerDocument[currentIndex].splice(existingTagIndex, 1, { tag: selectedTag, start: selectedText.startIndex, end });
            } else {
              // Caso contrário, adicione uma nova tag
              this.tagService.addTagToDocument(currentIndex, selectedTag, selectedText.startIndex, end);
            }
            this.updateTextWithTags();
            console.log(this.tagService.getTagsForDocument(this.currentIndex))
        
          }
        });
      }
    }
  }

  // getSelectedText(textArea: Element): SelectedTextResult | null {
  //   // descontar todos os length de tags existentes antes da seleção e depois
  //     const selection = window.getSelection();
  //     if (selection && selection.rangeCount > 0) {
  //         const range = selection.getRangeAt(0);
  //         const preSelectionRange = range.cloneRange();
  //         preSelectionRange.selectNodeContents(textArea);
  //         preSelectionRange.setEnd(range.startContainer, range.startOffset);
  //         const startIndex = preSelectionRange.toString().length;
  //         const selectedText = textArea.textContent?.substring(startIndex, startIndex + range.toString().length) || '';
  //         const length = range.toString().length;
  //         console.log("Índice de início:", startIndex);
  //         console.log("Texto selecionado:", selectedText);
  //         console.log("Comprimento do texto selecionado:", length);
  //         return { text: selectedText, startIndex: startIndex, length: length };
  //     }
  //     return null;
  // }


  getSelectedText(textArea: Element): SelectedTextResult | null {
    const selection = window.getSelection();

    const spanTagLengthInicio = `<span style="background-color: #000000;">`.length;
    const spanTagLengthFim ='</span>'.length;

    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Obter o texto completo da div
        const divText = textArea.textContent;

        // Obter o índice inicial da seleção
        let startIndex = 0;
        const nodes = range.startContainer.parentNode?.childNodes;
        if (nodes) {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i] === range.startContainer) {
                    startIndex += range.startOffset;
                    break;
                } else {
                    startIndex += nodes[i].textContent?.length || 0;
                }
            }
        }

        // Contar as tags <span> que estão antes do índice inicial da seleção
        const spanTagsBefore = (divText?.substring(0, startIndex).match(/<span[^>]*>/g) || []).length;

        // Ajustar o índice inicial da seleção considerando as tags <span>
        const adjustedStartIndex = startIndex - (spanTagsBefore * (spanTagLengthInicio + spanTagLengthFim));

        // Obter o texto selecionado
        const selectedText = selection.toString();
        const length = selectedText.length;

        return { text: selectedText, startIndex: adjustedStartIndex, length: length };
    }
    return null;
}

  adjustSpanTags(){
    const spanTagLengthInicio = `<span style="background-color: #000000;">`.length;
    const spanTagLengthFim ='</span>'.length;
  }

  // getTagsForCurrentFile(): Tag[] {
  //   const tags = this.tagService.getTagsForDocument(this.currentIndex);
  //   return tags.map(tag => ({ name: tag.tag, color: this.tagService.tags.find(t => t.name === tag.tag)?.color || '#000000' }));
  // }

  updateTextWithTags() {
    const contentElement = document.querySelector('.custom-textarea');
    if (contentElement && this.currentFile) {
      const content = this.currentFile.content;

      let updatedContent = '';
  
      const tags = this.tagService.getTagsForDocument(this.currentIndex);
      
      const spanTagLengthInicio = `<span style="background-color: #000000;">`.length;

      const spanTagLengthFim ='</span>'.length;
      let currentPosition = 0;
      let tagNum = 0
      
      tags.forEach(tag => {
        const tagColor = this.tagService.tags.find(t => t.name === tag.tag)?.color || '#000000';

        let start = 0
        let end = 0
      
        start = tag.start + (tagNum * (spanTagLengthInicio + spanTagLengthFim));
        end = start + (tag.end - tag.start);// + spanTagLengthInicio + spanTagLengthFim;
        console.log('Inicio coloracao: ', start)
        console.log('Fim coloracao: ', end)
        updatedContent += content.substring(currentPosition, start);
        updatedContent += `<span style="background-color: ${tagColor};">${content.substring(start, end)}</span>`;
        currentPosition = tag.end //+ spanTagLengthFim;

      });
  
      updatedContent += content.substring(currentPosition);
      //updatedContent = updatedContent.replace(/\n/g, '<br>');
      //updatedContent = updatedContent.replace(/&nbsp;/g, ' ');//

      contentElement.innerHTML = updatedContent;
      tagNum += 1;
    }
  }
  // onTextSelect(selectedText: string, startIndex: number, endIndex: number) {
  //   //console.log("Texto selecionado:", selectedText);
  //   console.log("Inicio:", startIndex)
  //   console.log("Fim:", endIndex)
    
  //   if (selectedText) {
  //     const dialogRef = this.dialog.open(TagsSelectionComponent);
  
  //     dialogRef.afterClosed().subscribe((selectedTag: string) => {
  //       if (selectedTag) {
  //         const currentIndex = this.currentIndex;
  //         if (this.currentFile) {
  //           const content = this.currentFile.content;
  //           const start = startIndex;
  //           const end = endIndex;
  //           console.log("start:", start);
  //           console.log("end:", end);
  //           const existingTagIndex = this.tagService.getTagsForDocument(currentIndex).findIndex(tag => tag.start === start && tag.end === end);
            
  //           if (existingTagIndex !== -1) {
  //             // Se uma tag já existe com o mesmo início e fim, substitua-a
  //             this.tagService.tagsPerDocument[currentIndex].splice(existingTagIndex, 1, { tag: selectedTag, start, end });
  //           } else {
  //             // Caso contrário, adicione uma nova tag
  //             this.tagService.addTagToDocument(currentIndex, selectedTag, start, end);
  //           }
  //           //this.updateTextWithTags();
  //           console.log(this.tagService.getTagsForDocument(this.currentIndex));
  //         }
  //       }
  //     });
  //   }
  // }
  
  
  onKeyUp(text: string) {
    if (this.currentFile) {
      this.currentFile.content = text;
    }
  }

  getTagsForCurrentFile(): { name: string, text: string, textPreview: string, start: number, end: number }[] {
    const tags = this.tagService.getTagsForDocument(this.currentIndex);
    const content = this.currentFile ? this.currentFile.content : '';
    
    // Ordenar as tags pelo índice de início (start)
    tags.sort((a, b) => a.start - b.start);

    return tags.map(tag => {
      const text = content.substring(tag.start, tag.end);
      const maxLength = 50; // Define o comprimento máximo do texto exibido na coluna "Texto"
      const truncatedText = text//text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
      return { name: tag.tag, text: text, textPreview: truncatedText, start: tag.start, end: tag.end };
    });
}

  deleteTag(tagIndex: number) {
    // Verifique se o índice da tag está dentro dos limites do array de tags do documento atual
    if (this.tagService.tagsPerDocument[this.currentIndex] && tagIndex >= 0 && tagIndex < this.tagService.tagsPerDocument[this.currentIndex].length) {
      this.tagService.tagsPerDocument[this.currentIndex].splice(tagIndex, 1);
    }
  }

  addTag() {
    if (this.newTag) {
      // Verifica se a tag já existe
      const existingTag = this.tagService.tags.find(tag => tag.name === this.newTag);
      if (!existingTag) {
        // Se a tag não existir, então adiciona
        this.tagService.addTag(this.newTag);
      }
      this.newTag = '';
    }
  }

  gerarJson(): void{
    const jsonData: [string, { entities: [number, number, string][] }][] = [];
    this.files.forEach((file, index) => {
      const content = file.content;
      const tags = this.tagService.getTagsForDocument(index); // Passando o índice do documento
      // const entities = tags.map(tag => [tag.start, tag.end, tag.tag]) as [number, number, string][];

      // const fileData: [string, { entities: [number, number, string][] }] = [content, { entities: entities }];
      // jsonData.push(fileData);
      if (tags.length > 0) { // Verificar se o número de tags é maior que zero
          const entities = tags.map(tag => [tag.start, tag.end, tag.tag]) as [number, number, string][];
          const fileData: [string, { entities: [number, number, string][] }] = [content, { entities: entities }];
          jsonData.push(fileData);
      }
    });

    const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.json';
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
