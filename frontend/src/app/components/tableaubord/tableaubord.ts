import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ProduitService } from '../../services/produit';
import { Produit } from '../../models/produits.models';

@Component({
  selector: 'app-tableaubord',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tableaubord.html',
  styleUrl: './tableaubord.css',
})
export class Tableaubord implements OnInit {
  produits: any[] = [];
  produitsEnAlerte: any[] = [];
  peremptionsProches: any[] = [];
  fournisseurs: any[] = [];
  isLoading: boolean = true;

  constructor(
    private produitService: ProduitService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerDonneesInitiales();
  }

  chargerDonneesInitiales() {
    this.isLoading = true;
    const requeteProduits = this.produitService.getProduits();
    const requeteFournisseurs = this.http.get<any>('http://localhost:8000/api/fournisseurs');

    forkJoin([requeteProduits, requeteFournisseurs]).subscribe({
      next: ([reponseProduits, reponseFournisseurs]) => {
        this.fournisseurs = reponseFournisseurs['hydra:member'] || reponseFournisseurs.member || [];
        const rawProduits = reponseProduits['hydra:member'] || reponseProduits.member || [];
        
        // Variables pour le calcul des péremptions
        const aujourdhui = new Date();
        const limiteTrenteJours = new Date();
        limiteTrenteJours.setDate(aujourdhui.getDate() + 30);
        const tempPeremptions: any[] = [];

        this.produits = rawProduits.map((p: any) => {
          let total = 0;
          if (p.lots && Array.isArray(p.lots)) {
            p.lots.forEach((lot: any) => {
              // Calcul de la quantité totale
              total += parseFloat(lot.contenanceRestante || 0);

              // Calcul de la péremption (on verifie que la date de péremption est dans les 30 prochains jours)
              const datePeremp = new Date(lot.datePeremption);
              if (datePeremp > aujourdhui && datePeremp <= limiteTrenteJours) {
                const diffTime = Math.abs(datePeremp.getTime() - aujourdhui.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // pour dire 1000 ms/s * 60 s/min * 60 min/h * 24 h/jour 
                
                tempPeremptions.push({
                  nom: p.nom,
                  numeroLot: lot.numeroLot,
                  datePeremption: lot.datePeremption,
                  joursRestants: diffDays
                });
              }
            });
          }
          return { ...p, quantiteTotale: total };
        });

        // Filtrer les produits en alerte (quantité totale < seuil)
        this.produitsEnAlerte = this.produits.filter(p => p.quantiteTotale < (p.seuil || 0));
        
        // On trie les péremptions par urgence (le plus proche en premier)
        this.peremptionsProches = tempPeremptions.sort((a, b) => a.joursRestants - b.joursRestants);

        this.isLoading = false; // On verifie que les données ne charge plus 
        this.cdr.detectChanges(); // On force la détection de changement pour mettre à jour l'affichage après le chargement des données
      },
      error: (err) => {
        console.error('Erreur lors du chargement initial :', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}