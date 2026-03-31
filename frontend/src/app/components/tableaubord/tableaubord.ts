import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProduitService } from '../../services/produit'; 
import { Produit } from '../../models/produits.models';

@Component({
  selector: 'app-tableaubord',
  imports: [],
  templateUrl: './tableaubord.html',
  styleUrl: './tableaubord.css',
})
export class Tableaubord implements OnInit {
  produits: Produit[] = [];

  // 2. On injecte le ChangeDetectorRef dans le constructeur
  constructor(
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef 
  ) {}

 ngOnInit(): void {
    this.produits = []; 

    this.produitService.getProduits().subscribe({
      next: (data) => {
        console.log('🕵️ Réponse brute :', data); 
        this.produits = data.member || data['hydra:member'] || []; 
        
        // 3. LA MAGIE : On dit à Angular de valider ce nouveau chiffre immédiatement
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('🚨 Aïe, la requête a échoué :', err);
      }
    });
  }
}
