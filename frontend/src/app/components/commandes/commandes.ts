import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../search';
import { HighlightPipe } from '../../highlight-pipe';

@Component({
  selector: 'app-commandes',
  imports: [HighlightPipe], // On garde ton tableau vide pour le moment
  templateUrl: './commandes.html',
  styleUrl: './commandes.css',
})
export class Commandes implements OnInit {

  commandes: any[] = []; // Tes données de commandes viendront ici
  motRecherche: string = ''; // La variable qui stocke ce qu'on tape en haut

  // 1. On connecte le service au composant
  constructor(private searchService: SearchService) {}

  // 2. Cette fonction se lance automatiquement au chargement de la page
  ngOnInit() {
    // On écoute la barre de recherche en permanence
    this.searchService.currentSearch.subscribe(texte => {
      this.motRecherche = texte;
    });
  }
}