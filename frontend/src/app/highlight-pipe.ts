import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, args: string): SafeHtml {
    if (!args || args.length < 1 || !value) {
      return value;
    }
    
    const text = value.toString();
    // On échappe les caractères spéciaux pour éviter les erreurs JS
    const search = args.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(search, 'gi');
    
    const result = text.replace(re, `<mark>$&</mark>`);
    
    // TRÈS IMPORTANT : bypassSecurityTrustHtml doit être appelé à chaque fois
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}