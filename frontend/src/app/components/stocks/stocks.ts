import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProduitService } from '../../services/produit'; 
import { Produit } from '../../models/produits.models';

// 1. IMPORTS POUR LA RECHERCHE
import { SearchService } from '../../search'; // Vérifie le chemin exact
import { HighlightPipe } from '../../highlight-pipe'; // Vérifie le chemin exact

@Component({
  selector: 'app-stocks',
  standalone: true, 
  // 2. AJOUT DU HIGHLIGHTPIPE DANS LES IMPORTS
  imports: [CommonModule, HighlightPipe],
  templateUrl: './stocks.html',
  styleUrl: './stocks.css',
})
export class Stocks implements OnInit {
  produits: any[] = []; // (J'ai mis any[] pour éviter les erreurs TS avec quantiteTotale et isExpanded si non définis dans ton modèle Produit)

  // 3. VARIABLE POUR STOCKER LE MOT RECHERCHÉ
  motTape: string = '';

  constructor(
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef,
    private searchService: SearchService // <-- 4. Injection du service de recherche
  ) {}

  ngOnInit(): void {
    // A. Chargement des produits
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

    // B. Écoute de la barre de recherche globale (AJOUT)
    this.searchService.currentSearch.subscribe(valeur => {
      this.motTape = valeur;
      this.cdr.markForCheck(); 
      this.cdr.detectChanges(); 
    });
  }

  toggleLots(produit: any): void {
    // La fonction la plus simple du monde : on ouvre, on ferme. Les données sont DÉJÀ là !
    produit.isExpanded = !produit.isExpanded;
  }
}