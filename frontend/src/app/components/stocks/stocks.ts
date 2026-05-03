import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { forkJoin } from 'rxjs'; 
import { FormsModule } from '@angular/forms'; // <-- 1. AJOUT POUR LE [(ngModel)]

import { ProduitService } from '../../services/produit'; 
import { Produit } from '../../models/produits.models';


@Component({
  selector: 'app-stocks',
  standalone: true, 
  // 2. AJOUT DU FORMSMODULE ICI
  imports: [CommonModule, FormsModule],
  templateUrl: './stocks.html',
  styleUrl: './stocks.css',
})
export class Stocks implements OnInit {
  produits: any[] = []; 
  motTape: string = '';

  constructor(
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router 
  ) {}

    // --- VARIABLES POUR LE NOUVEAU PRODUIT ---
  afficherFormulaireProduit: boolean = false;
  listeFournisseurs: any[] = []; // Contiendra la liste des fournisseurs de la BDD
  
  // Modèle vierge
  nouveauProduit: any = {
    nom: '',
    nomScientifique: '',
    fonction: '',
    cosmos: '',
    seuil: 0, // <-- AJOUT DU SEUIL ICI
    unite: 'g',
    fournisseurs: []
  };

  ngOnInit(): void {
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
            isExpanded: false      
          };
        });

        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('🚨 Erreur API :', err)
    });

  }

  toggleLots(produit: any): void {
    produit.isExpanded = !produit.isExpanded;
  }

  // ==========================================
  // NOUVELLES FONCTIONS : AJOUT DE PRODUIT
  // ==========================================

  AjouterProduit(): void {
    // Affiche ou masque le formulaire
    this.afficherFormulaireProduit = !this.afficherFormulaireProduit;

    // Si on ouvre le formulaire et qu'on n'a pas encore chargé les fournisseurs, on fait la requête
    if (this.afficherFormulaireProduit && this.listeFournisseurs.length === 0) {
      this.http.get<any>('http://127.0.0.1:8000/api/fournisseurs').subscribe({
        next: (res) => {
          this.listeFournisseurs = res['hydra:member'] || res.member || [];
        },
        error: (err) => console.error("Erreur lors du chargement des fournisseurs", err)
      });
    }
  }

  // Permet d'afficher "au kg", "au L" ou "à l'unité" selon l'unité choisie
  getPrixUniteLabel(): string {
    if (this.nouveauProduit.unite === 'g') return 'kg';
    if (this.nouveauProduit.unite === 'ml') return 'L';
    return 'unité';
  }

  ajouterFournisseur(): void {
    this.nouveauProduit.fournisseurs.push({ fournisseurId: '', moq: 0, prix: 0 });
  }

  retirerFournisseur(index: number): void {
    this.nouveauProduit.fournisseurs.splice(index, 1);
  }

  sauvegarderNouveauProduit(): void {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/ld+json' })
    };

    // 1. On prépare l'objet Produit avec le seuil
    const payloadProduit = {
      nom: this.nouveauProduit.nom,
      nomScientifique: this.nouveauProduit.nomScientifique,
      fonction: this.nouveauProduit.fonction,
      cosmos: this.nouveauProduit.cosmos,
      seuil: this.nouveauProduit.seuil != null ? Number(this.nouveauProduit.seuil) : 0, // <-- AJOUT DU SEUIL (converti en nombre pour Symfony)
      unite: this.nouveauProduit.unite,
      quantiteTotale: 0 // Par défaut à la création
    };

    // 2. Requête POST pour créer le Produit
    this.http.post<any>('http://127.0.0.1:8000/api/produits', payloadProduit, httpOptions).subscribe({
      next: (produitCree) => {
        
        // 3. Préparer les requêtes pour lier les fournisseurs
        const requetesFournisseurs = this.nouveauProduit.fournisseurs
          .filter((f: any) => f.fournisseurId !== '')
          .map((f: any) => {
            const payloadFournisseur = {
              produit: produitCree['@id'],
              fournisseur: f.fournisseurId,
              MOQ: f.moq != null ? f.moq.toString() : "0", 
              prix: f.prix != null ? f.prix.toString() : "0" 
            };

            return this.http.post('http://127.0.0.1:8000/api/fournis_pars', payloadFournisseur, httpOptions);
          });
          
        if (requetesFournisseurs.length > 0) {
          forkJoin(requetesFournisseurs).subscribe({
            next: () => this.finaliserAjout(produitCree),
            error: (err) => alert("Le produit est créé, mais erreur lors de l'ajout des fournisseurs.")
          });
        } else {
          this.finaliserAjout(produitCree);
        }
      },
      error: (err) => {
        console.error("Erreur lors de la création du produit :", err);
        alert("Erreur lors de la création du produit.");
      }
    });
  }

  finaliserAjout(nouveauProduitAPI: any): void {
    alert('✅ Produit ajouté avec succès !');
    
    // On l'ajoute visuellement au tableau
    this.produits.push({
      ...nouveauProduitAPI,
      lots: [],
      isExpanded: false
    });

    // On réinitialise le formulaire (avec le seuil à 0)
    this.nouveauProduit = { nom: '', nomScientifique: '', fonction: '', cosmos: '', seuil: 0, unite: 'g', fournisseurs: [] };
    this.afficherFormulaireProduit = false;
    this.cdr.detectChanges();
  }

  // ==========================================
  // NOUVELLES FONCTIONS POUR LE RETRAIT DE LOTS
  // ==========================================

  activerModeRetrait(lot: any, event: Event): void {
    event.stopPropagation(); // Évite de replier la ligne parente
    lot.isRetraitMode = true;
    lot.qteARetirer = null; // Prépare l'input à vide
  }

  annulerRetrait(lot: any, event: Event): void {
    event.stopPropagation();
    lot.isRetraitMode = false;
    lot.qteARetirer = null;
  }

  validerRetrait(lot: any, produit: any, event: Event): void {
    event.stopPropagation();

    if (lot.qteARetirer && lot.qteARetirer > 0 && lot.qteARetirer <= lot.contenanceRestante) {
      
      const nouvelleQteLot = lot.contenanceRestante - lot.qteARetirer;
      const nouvelleQteProduit = (produit.quantiteTotale || 0) - lot.qteARetirer;

      const httpOptionsPatch = {
        headers: new HttpHeaders({
          'Content-Type': 'application/merge-patch+json'
        })
      };

      // 1. Requête pour le Produit (mise à jour du total)
      const updateProduit$ = this.http.patch(`http://127.0.0.1:8000/api/produits/${produit.id}`, {
        quantiteTotale: nouvelleQteProduit
      }, httpOptionsPatch);

      // 2. Définition de l'action pour le Lot (DELETE ou PATCH)
      let actionLot$;

      if (nouvelleQteLot === 0) {
        // Si la quantité tombe à 0, on prépare une requête de suppression
        actionLot$ = this.http.delete(`http://127.0.0.1:8000/api/lots/${lot.id}`);
      } else {
        // Sinon, on prépare une simple mise à jour partielle
        actionLot$ = this.http.patch(`http://127.0.0.1:8000/api/lots/${lot.id}`, {
          contenanceRestante: nouvelleQteLot
        }, httpOptionsPatch);
      }

      // 3. On lance les deux requêtes en parallèle
      forkJoin([actionLot$, updateProduit$]).subscribe({
        next: () => {
          // Succès ! Mise à jour de l'affichage front-end
          
          if (nouvelleQteLot === 0) {
            // On supprime le lot du tableau visuel
            produit.lots = produit.lots.filter((l: any) => l.id !== lot.id);
          } else {
            // On met à jour la quantité visuelle et on ferme l'input
            lot.contenanceRestante = nouvelleQteLot;
            lot.isRetraitMode = false;
            lot.qteARetirer = null;
          }

          // Mise à jour du total du produit parent
          if (produit.quantiteTotale !== undefined) {
            produit.quantiteTotale = nouvelleQteProduit;
          }

          // Rafraîchir la vue Angular
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("🚨 Erreur lors de la sauvegarde en base de données :", err);
          alert("Une erreur est survenue lors de la modification du stock. Veuillez réessayer.");
        }
      });
    }
  }



  // ==========================================
  // FONCTIONS POUR L'INVENTAIRE (Existantes)
  // ==========================================

  consulterInventaires(): void {
    this.router.navigate(['/inventaires']); 
  }

  creerNouvelInventaire(): void {
    if (confirm("Voulez-vous figer l'état actuel du stock et créer un nouvel inventaire ?")) {
      
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/ld+json'
        })
      };

      const nouvelInventaire = {
        dateInv: new Date().toISOString()
      };

      this.http.post<any>('http://127.0.0.1:8000/api/inventaires', nouvelInventaire, httpOptions).subscribe({
        next: (inventaireCree) => {
          
          const requetesLignes = this.produits.map(produit => {
            const payloadLigne = {
              inventaire: inventaireCree['@id'],
              nomProduit: produit.nom,
              quantite: produit.quantiteTotale || 0
            };
            
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