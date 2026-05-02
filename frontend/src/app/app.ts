import { Component } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterModule} from '@angular/router';
import { SearchService } from './search';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // On injecte le service dans le constructeur
  constructor(private searchService: SearchService) {}

  // Cette fonction envoie le texte au service à chaque touche pressée
  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchService.updateSearch(inputElement.value);
  }
}