import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// Plus besoin de HttpClient ici !
import { ProduitService } from '../../services/produit'; 
import { Produit } from '../../models/produits.models';

@Component({
  selector: 'app-stocks',
  standalone: true, // Ou "imports: [CommonModule]" selon ta config
  imports: [CommonModule],
  templateUrl: './stocks.html',
  styleUrl: './stocks.css',
})
export class Stocks implements OnInit {
  produits: Produit[] = [];

  constructor(
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.produitService.getProduits().subscribe({
      next: (data) => {
        const rawData = data.member || data['hydra:member'] || []; 
        
        // Dès qu'on reçoit les produits, on boucle pour calculer le total
        this.produits = rawData.map((p: any) => {
          let total = 0;

          // Si l'API Symfony a bien envoyé les objets Lots (et pas juste des textes)
          if (p.lots && Array.isArray(p.lots) && p.lots.length > 0) {
            
            // On s'assure que c'est bien un objet avec une quantité
            if (typeof p.lots[0] !== 'string') {
              p.lots.forEach((lot: any) => {
                total += +(lot.quantite || 0); // On additionne direct !
              });
            } else {
              console.error("⚠️ Symfony envoie encore des URLs pour les lots, vérifie tes #[Groups] dans Lots.php et vide le cache !");
            }
          }

          return {
            ...p,
            quantiteTotale: total, // Le total est prêt pour le HTML
            isExpanded: false      // Le tiroir est fermé par défaut
          };
        });

        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('🚨 Erreur API :', err)
    });
  }

  toggleLots(produit: any): void {
    // La fonction la plus simple du monde : on ouvre, on ferme. Les données sont DÉJÀ là !
    produit.isExpanded = !produit.isExpanded;
  }
}