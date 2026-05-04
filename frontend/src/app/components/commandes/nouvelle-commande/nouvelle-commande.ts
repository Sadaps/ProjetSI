import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

import { CommandeService } from '../../../services/commande';
import { ProduitService } from '../../../services/produit'; 

@Component({
  selector: 'app-nouvelle-commande',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvelle-commande.html',
  styleUrl: './nouvelle-commande.css'
})
export class NouvelleCommande implements OnInit {
  
  // Paramètre métier
  seuilAlerte: number = 20; 

  // Données
  produits: any[] = [];
  fournisseurs: any[] = [];
  produitsEnAlerte: any[] = [];
  
  // Formulaire
  fournisseurSelectionne: any = null;
  produitsDuFournisseur: any[] = []; 
  lignesCommande: any[] = []; 
  
  // États
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private commandeService: CommandeService,
    private produitService: ProduitService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.chargerDonneesInitiales();
  }

  chargerDonneesInitiales() {
    const requeteProduits = this.produitService.getProduits();
    const requeteFournisseurs = this.http.get<any>('http://localhost:8000/api/fournisseurs');

    forkJoin([requeteProduits, requeteFournisseurs]).subscribe({
      next: ([reponseProduits, reponseFournisseurs]) => {
        this.fournisseurs = reponseFournisseurs['hydra:member'] || reponseFournisseurs.member || [];

        const rawProduits = reponseProduits.member || reponseProduits['hydra:member'] || [];
        
        this.produits = rawProduits.map((p: any) => {
          let total = 0;
          if (p.lots && Array.isArray(p.lots) && p.lots.length > 0 && typeof p.lots[0] !== 'string') {
            p.lots.forEach((lot: any) => {
              total += +(lot.contenanceRestante || 0);
            });
          }
          return { ...p, quantiteTotale: total };
        });

        this.produitsEnAlerte = this.produits.filter(p => p.quantiteTotale < p.seuil);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('🚨 Erreur lors du chargement initial :', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFournisseurChange() {
    if (!this.fournisseurSelectionne) {
      this.produitsDuFournisseur = [];
      this.lignesCommande = [];
      this.cdr.detectChanges();
      return;
    }

    const idFournisseurChoisi = this.fournisseurSelectionne['@id'] || this.fournisseurSelectionne.id;

    this.produitsDuFournisseur = this.produits.filter(p => {
      if (!p.fournisPar || !Array.isArray(p.fournisPar)) return false;
      
      return p.fournisPar.some((fp: any) => {
        if (!fp.fournisseur) return false;
        if (typeof fp.fournisseur === 'string') return fp.fournisseur === idFournisseurChoisi;
        const idAComparer = fp.fournisseur['@id'] || fp.fournisseur.id;
        return idAComparer === idFournisseurChoisi;
      });
    });

    this.lignesCommande = [];
    this.ajouterLigneCommande();
    this.cdr.detectChanges();
  }

  ajouterLigneCommande() {
    this.lignesCommande.push({
      produitSelectionne: null,
      quantiteAffichee: 1, //  La quantité que l'utilisateur voit et tape (en kg/L)
      prixUnitaire: 0, 
      moqDb: 1,            //  Le vrai MOQ de la base (en g/ml)
      moqAffichee: 1       // Le MOQ converti pour l'utilisateur (en kg/L)
    });
  }

  supprimerLigneCommande(index: number) {
    this.lignesCommande.splice(index, 1);
  }

  // --- NOUVEAU : Fonctions d'affichage pour l'interface ---
  getTextePrixUnitaire(ligne: any): string {
    if (!ligne.produitSelectionne) return 'Prix unitaire';
    const unite = ligne.produitSelectionne.unite;
    if (unite === 'g') return 'Prix au kg';
    if (unite === 'ml') return 'Prix au L';
    return 'Prix unitaire';
  }

  getAffichageMoq(ligne: any): string {
    if (!ligne.produitSelectionne) return '';
    const unite = ligne.produitSelectionne.unite;
    if (unite === 'g') return `${ligne.moqAffichee} kg`;
    if (unite === 'ml') return `${ligne.moqAffichee} L`;
    return `${ligne.moqAffichee} pce(s)`;
  }
  // ---------------------------------------------------------

  onProduitChange(ligne: any) {
    if (!ligne.produitSelectionne) {
      ligne.prixUnitaire = 0;
      ligne.moqDb = 1;
      ligne.moqAffichee = 1;
      return;
    }

    const idFournisseurChoisi = this.fournisseurSelectionne['@id'] || this.fournisseurSelectionne.id;

    const relationFournisseur = ligne.produitSelectionne.fournisPar.find((fp: any) => {
      const idAComparer = fp.fournisseur['@id'] || fp.fournisseur.id || fp.fournisseur;
      return idAComparer === idFournisseurChoisi;
    });

    if (relationFournisseur) {
      ligne.prixUnitaire = parseFloat(relationFournisseur.prix);
      ligne.moqDb = parseFloat(relationFournisseur.MOQ); 
      
      // On convertit la MOQ pour l'affichage
      const unite = ligne.produitSelectionne.unite;
      if (unite === 'g' || unite === 'ml') {
        ligne.moqAffichee = ligne.moqDb / 1000;
      } else {
        ligne.moqAffichee = ligne.moqDb;
      }

      // On pré-remplit la saisie avec le MOQ exigé
      ligne.quantiteAffichee = ligne.moqAffichee;
    }
  }

  calculerPrixTotal(): number {
    return this.lignesCommande.reduce((total, ligne) => {
      // On multiplie la quantité *affichée* (kg/L) par le prix (au kg/L) !
      return total + (ligne.quantiteAffichee * ligne.prixUnitaire);
    }, 0);
  }

  validerCommande() {
    this.isSubmitting = true;

    // On vérifie avec la quantité affichée et le MOQ affiché
    const lignesValides = this.lignesCommande.filter(ligne => ligne.produitSelectionne && ligne.quantiteAffichee >= ligne.moqAffichee);

    if (lignesValides.length !== this.lignesCommande.length) {
      alert("Attention, certaines quantités ne respectent pas le minimum de commande (MOQ) exigé par le fournisseur.");
      this.isSubmitting = false;
      return;
    }

    const payload = {
      fournisseur: this.fournisseurSelectionne['@id'] || `/api/fournisseurs/${this.fournisseurSelectionne.id}`,
      statut: "En attente",
      date_commande: new Date().toISOString(),
      prix: this.calculerPrixTotal().toFixed(2),
      
      contenir: lignesValides.map(ligne => {
        // Le moment de la traduction inversée pour la Base de Données !
        let quantiteFinale = ligne.quantiteAffichee;
        const unite = ligne.produitSelectionne.unite;
        
        // Si c'est en g ou ml, on re-multiplie par 1000 pour stocker en petites unités
        if (unite === 'g' || unite === 'ml') {
          quantiteFinale = quantiteFinale * 1000;
        }

        return {
          produit: ligne.produitSelectionne['@id'],
          quantite: parseFloat(quantiteFinale.toFixed(2)) 
        };
      })
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/ld+json',
      'Accept': 'application/ld+json'
    });

    this.http.post('http://localhost:8000/api/commandes', payload, { headers }).subscribe({
      next: (reponseApi) => {
        console.log("✅ Commande créée avec succès !", reponseApi);
        this.isSubmitting = false;
        
        alert("Commande passée avec succès !");
        this.router.navigate(['/commandes/historique']);
      },
      error: (err) => {
        console.error("🚨 Erreur lors de la création de la commande :", err);
        this.isSubmitting = false;
        this.cdr.detectChanges();
        
        const messageErreur = err.error?.['hydra:description'] || err.message || "Erreur inconnue";
        alert("Erreur lors de la validation : " + messageErreur);
      }
    });
  }
}