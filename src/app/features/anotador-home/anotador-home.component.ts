import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
    public dialog: MatDialog,
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
            if (this.files.length === 1) {
              this.setCurrentFile(this.files[0]);
            }
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
 
  
  onTextSelect(event: MouseEvent) {
    // Evita o comportamento padrão do menu de contexto do navegador
    event.preventDefault();
    const mouseX = event.pageX;
    const mouseY = event.pageY;
    
    const textArea = document.querySelector('.custom-textarea');
    if (textArea) {
      const selectedText = this.getSelectedText(textArea);
      //console.log("Texto selecionado:", selectedText);
      
      if (selectedText) {
        const dialogRef = this.dialog.open(TagsSelectionComponent, {
          //hasBackdrop: false, // Não terá um fundo de overlay
          position: { left: `${mouseX}px`, top: `${mouseY}px` }, // Define a posição do MatDialog
        });

        dialogRef.afterClosed().subscribe((selectedTag: string) => {
          if (selectedTag) {
            const currentIndex = this.currentIndex;
            //console.log(selectedText.startIndex)
            //console.log(selectedText.length)
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

    const spanTagLengthInicio = `<span class="span-tag" style="background-color: #000000;border-radius: 5px; display: user-select: none;padding-left: 5px;">`.length;

    const spanTagLengthFim ='<button id="XXXXXXXX" class="fechar-button" (click)="fecharTag($event)" style="background-color: transparent; border: none; cursor: pointer;"><img src="assets/fechar.png" alt="Fechar" style="width: 16px; height: 16px;"></button></span>'.length;

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
        const regex = /<span class="span-tag" style="background-color: #[0-9a-fA-F]{6};border-radius: 5px; user-select: none;padding-left: 5px;">/g;
        const spanTagsBefore = (divText?.substring(0, startIndex).match(regex) || []).length;
        //console.log("Tags before:", spanTagsBefore)
        //const spanTagsBefore = (divText?.substring(0, startIndex).match(/<span[^>]*>/g) || []).length;

        // Ajustar o índice inicial da seleção considerando as tags <span>
        const adjustedStartIndex = startIndex - (spanTagsBefore * (spanTagLengthInicio + spanTagLengthFim));
        console.log(adjustedStartIndex)
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

  fecharTag(id: string, event: Event) {
    const index = parseInt(id); // Converter o id em número
    console.log("ID convertido:", index);

    this.tagService.deleteTagInDocument(this.currentIndex, index);
    this.updateTextWithTags()
    event.stopPropagation(); // Impede a propagação do evento de clique para a área do texto selecionado
}
  // getTagsForCurrentFile(): Tag[] {
  //   const tags = this.tagService.getTagsForDocument(this.currentIndex);
  //   return tags.map(tag => ({ name: tag.tag, color: this.tagService.tags.find(t => t.name === tag.tag)?.color || '#000000' }));
  // }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = (event.target as HTMLElement).closest('.fechar-button');
    
    if (target) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      console.log("teste 3");
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    const target = (event.target as HTMLElement).closest('.fechar-button');
    if (target) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
      console.log("teste"); // Adicionar ação de deletar tag especifica
      this.fecharTag(target.id, event);
    }else {
      const target3 = (event.target as HTMLElement).closest('.span-tag');
      if (target3){ // Não faz nada
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
      }else {
        const target2 = (event.target as HTMLElement).closest('.custom-textarea');
        if (target2) {
          event.stopImmediatePropagation();
          event.stopPropagation();
          event.preventDefault();
          this.onTextSelect(event)
        }
    }
  }
  }

  updateTextWithTags() {
    const contentElement = document.querySelector('.custom-textarea');
    if (contentElement && this.currentFile) {
      const content = this.currentFile.content;

      let updatedContent = '';
  
      const tags = this.tagService.getTagsForDocument(this.currentIndex);
      
      const spanTagLengthInicio = `<span class="span-tag" style="background-color: #000000;border-radius: 5px; user-select: none;padding-left: 5px;">`.length;

      const spanTagLengthFim ='<button id="XXXXXXXX" class="fechar-button" (click)="fecharTag($event)" style="background-color: transparent; border: none; cursor: pointer;"><img src="assets/fechar.png" alt="Fechar" style="width: 16px; height: 16px;"></button></span>'.length;
      let currentPosition = 0;
      let tagNum = 0
      
      tags.forEach(tag => {
        const tagColor = this.tagService.tags.find(t => t.name === tag.tag)?.color || '#000000';
        const tagIndex = this.tagService.getTagsForDocument(this.currentIndex).findIndex(t => t === tag);
        
        let start = 0
        let end = 0
      
        start = tag.start;// + (tagNum * (spanTagLengthInicio + spanTagLengthFim));
        end = start + (tag.end - tag.start);// + spanTagLengthInicio + spanTagLengthFim;
        //console.log('Inicio coloracao: ', start)
        //console.log('Fim coloracao: ', end)
        updatedContent += content.substring(currentPosition, start);
        updatedContent += `<span class="span-tag" style="background-color: ${tagColor};border-radius: 5px; user-select: none;padding-left: 5px;">${content.substring(start, end)}<button id="${this.numberToString(tagIndex)}" class="fechar-button" (click)="fecharTag($event)" style="background-color: transparent; border: none; cursor: pointer;"><img src="assets/fechar.png" alt="Fechar" style="width: 16px; height: 16px;"></button></span>`;

        currentPosition = tag.end //+ spanTagLengthFim;
        tagNum += 1;
      });
  
      updatedContent += content.substring(currentPosition);
      //updatedContent = updatedContent.replace(/\n/g, '<br>');
      //updatedContent = updatedContent.replace(/&nbsp;/g, ' ');//

      contentElement.innerHTML = updatedContent;
      
    }
  }

  numberToString(num: number) {
    let strNum = num.toString();

    while (strNum.length < 8) {
      strNum = '0' + strNum
    }

    return strNum
  }
  
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

  deleteTagInDocument(tagIndex: number) {
    // Verifique se o índice da tag está dentro dos limites do array de tags do documento atual
    if (this.tagService.tagsPerDocument[this.currentIndex] && tagIndex >= 0 && tagIndex < this.tagService.tagsPerDocument[this.currentIndex].length) {
      this.tagService.tagsPerDocument[this.currentIndex].splice(tagIndex, 1);
    }
  }

  deleteTag(tagIndex: number) {
    // Verificar se o índice da tag está dentro dos limites do array de tags da service
    if (tagIndex >= 0 && tagIndex < this.tagService.tags.length) {
      const deletedTagName = this.tagService.tags[tagIndex].name; // Obtém o nome da tag a ser excluída
  
      // Remove todas as ocorrências da tag em todos os documentos
      this.tagService.removeTag(deletedTagName);
      this.tagService.tags.splice(tagIndex, 1);
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
