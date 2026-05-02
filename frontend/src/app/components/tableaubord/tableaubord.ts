import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Toujours utile d'avoir le CommonModule pour les *ngIf et *ngFor
import { ProduitService } from '../../services/produit'; 
import { Produit } from '../../models/produits.models';

// 1. IMPORTS POUR LA RECHERCHE
import { SearchService } from '../../search'; // Vérifie le chemin
import { HighlightPipe } from '../../highlight-pipe'; // Vérifie le chemin

@Component({
  selector: 'app-tableaubord',
  standalone: true, // Je te rajoute standalone: true par sécurité comme tes autres composants
  // 2. AJOUT DU COMMONMODULE ET DU HIGHLIGHTPIPE
  imports: [CommonModule, HighlightPipe],
  templateUrl: './tableaubord.html',
  styleUrl: './tableaubord.css',
})
export class Tableaubord implements OnInit {
  produits: Produit[] = [];

  // 3. VARIABLE POUR STOCKER LE MOT RECHERCHÉ
  motTape: string = '';

  constructor(
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef,
    private searchService: SearchService // <-- 4. Injection du service de recherche
  ) {}

 ngOnInit(): void {
    this.produits = []; 

    // A. Chargement des produits
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = data.member || data['hydra:member'] || []; 
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('🚨 Aïe, la requête a échoué :', err);
      }
    });

    // B. ÉCOUTE DE LA BARRE DE RECHERCHE
    this.searchService.currentSearch.subscribe(valeur => {
      this.motTape = valeur;
      this.cdr.markForCheck(); 
      this.cdr.detectChanges(); 
    });
  }
}