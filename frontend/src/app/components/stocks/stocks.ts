import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { forkJoin } from 'rxjs'; 
import { FormsModule } from '@angular/forms'; 

import { ProduitService } from '../../services/produit'; 
import { Produit } from '../../models/produits.models';


@Component({
  selector: 'app-stocks',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './stocks.html',
  styleUrl: './stocks.css',
})
export class Stocks implements OnInit {
  produits: any[] = []; // Notre base de données "brute"
  produitsAffiches: any[] = []; // Les produits réellement affichés (après filtre)
  
  // --- NOUVEAU : VARIABLES POUR LE FILTRE CATEGORIE ---
  categories: any[] = [];
  categorieSelectionnee: string = ''; 

  motTape: string = '';

  constructor(
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router 
  ) {}

  // --- VARIABLES POUR LE NOUVEAU PRODUIT ---
  afficherFormulaireProduit: boolean = false;
  listeFournisseurs: any[] = []; 
  
  nouveauProduit: any = {
    nom: '',
    nomScientifique: '',
    fonction: '',
    cosmos: '',
    seuil: 0, 
    unite: 'g',
    fournisseurs: [],
    categorie: ''
  };

  ngOnInit(): void {
    // NOUVEAU : On charge les produits ET les catégories en même temps !
    const requeteProduits = this.produitService.getProduits();
    const requeteCategories = this.http.get<any>('http://127.0.0.1:8000/api/categories');

    forkJoin([requeteProduits, requeteCategories]).subscribe({
      next: ([dataProduits, dataCategories]) => {
        
        // 1. Récupération des catégories
        this.categories = dataCategories['hydra:member'] || dataCategories.member || [];

        // 2. Récupération et traitement des produits
        const rawData = dataProduits.member || dataProduits['hydra:member'] || []; 
        
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

        // 3. Au démarrage, on affiche tout !
        this.produitsAffiches = [...this.produits];

        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('🚨 Erreur API :', err)
    });
  }

  // ==========================================
  // NOUVELLE FONCTION : FILTRER PAR CATEGORIE
  // ==========================================
  filtrerParCategorie(): void {
    if (!this.categorieSelectionnee || this.categorieSelectionnee === '') {
      // Si "Toutes les catégories" est sélectionné
      this.produitsAffiches = [...this.produits];
    } else {
      // Sinon on filtre !
      this.produitsAffiches = this.produits.filter(p => {
        if (!p.categorie) return false;
        
        // Selon si API Platform renvoie un objet ou une string IRI
        const idCategorieProduit = typeof p.categorie === 'string' ? p.categorie : (p.categorie['@id'] || p.categorie.id);
        
        return idCategorieProduit === this.categorieSelectionnee;
      });
    }
    this.cdr.detectChanges();
  }

  toggleLots(produit: any): void {
    produit.isExpanded = !produit.isExpanded;
  }

  AjouterProduit(): void {
    this.afficherFormulaireProduit = !this.afficherFormulaireProduit;

    if (this.afficherFormulaireProduit && this.listeFournisseurs.length === 0) {
      this.http.get<any>('http://127.0.0.1:8000/api/fournisseurs').subscribe({
        next: (res) => {
          this.listeFournisseurs = res['hydra:member'] || res.member || [];
        },
        error: (err) => console.error("Erreur lors du chargement des fournisseurs", err)
      });
    }
  }

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

    const payloadProduit = {
      nom: this.nouveauProduit.nom,
      nomScientifique: this.nouveauProduit.nomScientifique,
      fonction: this.nouveauProduit.fonction,
      cosmos: this.nouveauProduit.cosmos,
      seuil: this.nouveauProduit.seuil != null ? Number(this.nouveauProduit.seuil) : 0, 
      unite: this.nouveauProduit.unite,
      quantiteTotale: 0,
      categorie: this.nouveauProduit.categorie ? this.nouveauProduit.categorie : undefined
    };

    this.http.post<any>('http://127.0.0.1:8000/api/produits', payloadProduit, httpOptions).subscribe({
      next: (produitCree) => {
        
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
    
    // On l'ajoute dans la liste globale
    this.produits.push({
      ...nouveauProduitAPI,
      lots: [],
      isExpanded: false
    });
    
    // On met à jour l'affichage en repassant par le filtre actuel
    this.filtrerParCategorie();

    this.nouveauProduit = { nom: '', nomScientifique: '', fonction: '', cosmos: '', seuil: 0, unite: 'g', fournisseurs: [] , categorie: ''};
    this.afficherFormulaireProduit = false;
    this.cdr.detectChanges();
  }

  activerModeRetrait(lot: any, event: Event): void {
    event.stopPropagation(); 
    lot.isRetraitMode = true;
    lot.qteARetirer = null; 
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

      const updateProduit$ = this.http.patch(`http://127.0.0.1:8000/api/produits/${produit.id}`, {
        quantiteTotale: nouvelleQteProduit
      }, httpOptionsPatch);

      let actionLot$;

      if (nouvelleQteLot === 0) {
        actionLot$ = this.http.delete(`http://127.0.0.1:8000/api/lots/${lot.id}`);
      } else {
        actionLot$ = this.http.patch(`http://127.0.0.1:8000/api/lots/${lot.id}`, {
          contenanceRestante: nouvelleQteLot
        }, httpOptionsPatch);
      }

      forkJoin([actionLot$, updateProduit$]).subscribe({
        next: () => {
          if (nouvelleQteLot === 0) {
            produit.lots = produit.lots.filter((l: any) => l.id !== lot.id);
          } else {
            lot.contenanceRestante = nouvelleQteLot;
            lot.isRetraitMode = false;
            lot.qteARetirer = null;
          }

          if (produit.quantiteTotale !== undefined) {
            produit.quantiteTotale = nouvelleQteProduit;
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("🚨 Erreur lors de la sauvegarde :", err);
          alert("Une erreur est survenue. Veuillez réessayer.");
        }
      });
    }
  }

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