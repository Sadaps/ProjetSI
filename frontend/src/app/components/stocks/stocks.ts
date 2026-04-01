import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // 1. <-- AJOUTE CECI
import { ProduitService } from '../../services/produit'; 
import { Produit } from '../../models/produits.models';

@Component({
  selector: 'app-stocks',
  imports: [CommonModule],
  templateUrl: './stocks.html',
  styleUrl: './stocks.css',
})
export class Stocks implements OnInit {
  produits: Produit[] = [];

  // 2. <-- On injecte le HttpClient ici
  constructor(
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient 
  ) {}

  ngOnInit(): void {
    this.produits = []; 

    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = data.member || data['hydra:member'] || []; 
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('🚨 Aïe, la requête a échoué :', err);
      }
    });
  }

  toggleLots(produit: any): void {
    produit.isExpanded = !produit.isExpanded;

    if (produit.quantiteTotale === undefined) {
    produit.quantiteTotale = 0;
    }
    // Si on ouvre et qu'on a des lots
    if (produit.isExpanded && produit.lots && produit.lots.length > 0) {
      
      // On vérifie si ce sont des liens (strings)
      if (typeof produit.lots[0] === 'string') {
        const liensLots = [...produit.lots]; // On copie les URLs
        produit.lots = []; // On vide pour accueillir les vrais objets

        liensLots.forEach((lien: string) => {
          // IMPORTANT : Vérifie bien si ton lien commence déjà par http ou pas
          // Si le lien est "/api/lots/5", il faut ajouter le domaine
          const urlComplete = lien.startsWith('http') ? lien : `http://localhost:8000${lien}`;

          this.http.get(urlComplete).subscribe({
            next: (vraiLot) => {
              produit.lots.push(vraiLot);
              this.cdr.detectChanges(); // On force Angular à voir l'ajout
            },
            error: (err) => console.error('Erreur chargement lot:', err)
          });
        });
      }
    }
  }
}