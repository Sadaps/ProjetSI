import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <-- AJOUT pour les requêtes API
import { Router } from '@angular/router';          // <-- AJOUT pour la navigation
import { forkJoin } from 'rxjs';                   // <-- AJOUT pour lancer plusieurs requêtes en parallèle

import { ProduitService } from '../../services/produit'; 
import { Produit } from '../../models/produits.models';

// 1. IMPORTS POUR LA RECHERCHE
import { SearchService } from '../../search'; 
import { HighlightPipe } from '../../highlight-pipe'; 

@Component({
  selector: 'app-stocks',
  standalone: true, 
  // 2. AJOUT DU HIGHLIGHTPIPE DANS LES IMPORTS
  imports: [CommonModule, HighlightPipe],
  templateUrl: './stocks.html',
  styleUrl: './stocks.css',
})
export class Stocks implements OnInit {
  produits: any[] = []; 
  motTape: string = '';

  constructor(
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef,
    private searchService: SearchService,
    private http: HttpClient, // <-- Injection de HttpClient
    private router: Router    // <-- Injection du Router
  ) {}

  ngOnInit(): void {
    // A. Chargement des produits
    this.produitService.getProduits().subscribe({
      next: (data) => {
        const rawData = data.member || data['hydra:member'] || []; 
        
        this.produits = rawData.map((p: any) => {
          let total = 0;

          if (p.lots && Array.isArray(p.lots) && p.lots.length > 0) {
            if (typeof p.lots[0] !== 'string') {
              p.lots.forEach((lot: any) => {
                total += +(lot.quantite || 0); 
              });
            } else {
              console.error("⚠️ Symfony envoie encore des URLs pour les lots, vérifie tes #[Groups] dans Lots.php et vide le cache !");
            }
          }

          return {
            ...p,
            quantiteTotale: total, 
            isExpanded: false      
          };
        });

        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('🚨 Erreur API :', err)
    });

    // B. Écoute de la barre de recherche globale
    this.searchService.currentSearch.subscribe(valeur => {
      this.motTape = valeur;
      this.cdr.markForCheck(); 
      this.cdr.detectChanges(); 
    });
  }

  toggleLots(produit: any): void {
    produit.isExpanded = !produit.isExpanded;
  }

  // ==========================================
  // NOUVELLES FONCTIONS POUR L'INVENTAIRE
  // ==========================================

  // --- 1. BOUTON CONSULTER ---
  consulterInventaires(): void {
    // Redirige vers la future page qui listera les inventaires
    this.router.navigate(['/inventaires']); 
  }

  // --- 2. BOUTON CRÉER ---
  creerNouvelInventaire(): void {
  if (confirm("Voulez-vous figer l'état actuel du stock et créer un nouvel inventaire ?")) {
    
    // 2. Crée l'objet d'options avec le Content-Type
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/ld+json'
      })
    };

    const nouvelInventaire = {
      dateInv: new Date().toISOString()
    };

    // 3. Ajoute httpOptions comme 3ème argument du POST
    this.http.post<any>('http://127.0.0.1:8000/api/inventaires', nouvelInventaire, httpOptions).subscribe({
      next: (inventaireCree) => {
        
        const requetesLignes = this.produits.map(produit => {
          const payloadLigne = {
            inventaire: inventaireCree['@id'],
            nomProduit: produit.nom,
            quantite: produit.quantiteTotale || 0
          };
          
          // 4. Ajoute aussi httpOptions ici pour chaque ligne
          return this.http.post('http://127.0.0.1:8000/api/ligne_inventaires', payloadLigne, httpOptions);
        });

        if (requetesLignes.length > 0) {
          forkJoin(requetesLignes).subscribe({
            next: () => alert('✅ Inventaire créé avec succès !'),
            error: (err) => alert('Erreur lors de la création des lignes.')
          });
        }
      },
      error: (err) => {
        console.error(err);
        alert("Erreur de connexion à l'API pour l'inventaire.");
      }
    });
  }
}
}