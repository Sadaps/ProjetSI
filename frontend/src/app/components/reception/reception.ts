import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande'; 
import { forkJoin, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { SearchService } from '../../search'; 
import { HighlightPipe } from '../../highlight-pipe'; 

interface LigneReception {
  produitIri: string;
  nomProduit: string;
  nomScientifique: string;
  unite: string;          
  quantitePrevue: number;
  numeroLot: string;
  quantiteRecue: number;  
  datePeremption: string;
}

@Component({
  selector: 'app-reception',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightPipe],
  templateUrl: './reception.html',
  styleUrl: './reception.css'
})
export class Reception implements OnInit {
  selectedCommande: any = null;
  dateReception: string = new Date().toISOString().split('T')[0];
  notes: string = '';
  
  lignesLots: LigneReception[] = [];
  commandesEnAttente: any[] = [];
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  motTape: string = '';

  constructor(
    private commandeService: CommandeService, 
    private router: Router,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.commandeService.getCommandes().subscribe({
      next: (reponseApi) => {
        const toutesLesCommandes = reponseApi.member || reponseApi['hydra:member'] || [];
        this.commandesEnAttente = toutesLesCommandes.filter((cmd: any) => cmd.statut !== 'Reçue');
        this.isLoading = false; 
        this.cdr.detectChanges();
      },
      error: (erreur) => {
        console.error('Erreur lors du chargement des commandes', erreur);
        this.isLoading = false; 
      }
    });

    this.searchService.currentSearch.subscribe(valeur => {
      this.motTape = valeur;
      this.cdr.markForCheck(); 
      this.cdr.detectChanges(); 
    });
  }

  // --- NOUVELLE FONCTION MAGIQUE D'AFFICHAGE ---
  afficherQuantiteFormatee(quantite: number, unite: string): string {
    if (!quantite) return '0';
    if (unite === 'kg') {
      return (quantite * 1000).toLocaleString('fr-FR') + ' g';
    } else if (unite === 'ml' || unite === 'liquide') {
      return quantite.toLocaleString('fr-FR') + ' ml';
    } else if (unite === 'g') {
      return quantite.toLocaleString('fr-FR') + ' g';
    } else {
      return quantite.toLocaleString('fr-FR') + ' pce(s)';
    }
  }

  onCommandeChange() {
    if (!this.selectedCommande || !this.selectedCommande.contenir) {
      this.lignesLots = [];
      return;
    }

    this.lignesLots = this.selectedCommande.contenir.map((item: any) => {
      return {
        produitIri: item.produit['@id'], 
        nomProduit: item.produit.nom,
        nomScientifique: item.produit.nomScientifique,
        unite: item.produit.unite || 'unité', // Récupère l'unité depuis le back-end
        quantitePrevue: item.quantite,
        numeroLot: '',
        quantiteRecue: item.quantite, // On pré-remplit avec la quantité prévue pour faire gagner du temps !
        datePeremption: ''
      };
    });
  }

  validerReception() {
    // On vérifie que le N° Lot ET la péremption sont remplis
    const formulaireIncomplet = this.lignesLots.some(ligne => !ligne.datePeremption || !ligne.numeroLot);
    if (formulaireIncomplet) {
      alert("Veuillez remplir tous les numéros de lots et les dates de péremption !");
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const missions = this.lignesLots.map(ligne => {
      // 1. Création du lot avec la nouvelle structure
      const nouveauLot = {
        produit: ligne.produitIri, 
        contenanceRestante: ligne.quantiteRecue, 
        numeroLot: ligne.numeroLot,              
        datePeremption: ligne.datePeremption,
        dateEntreeLot: this.dateReception
      };

      return this.commandeService.creerLot(nouveauLot).pipe(
        switchMap((lotCree: any) => {
          // 2. Création du reçu (historique de la transaction)
          const nouveauRecu = {
            commande: `/api/commandes/${this.selectedCommande.id}`,
            lot: lotCree['@id'], 
            quantite: ligne.quantiteRecue,
            date_reception: this.dateReception,
            notes: this.notes
          };
          return this.commandeService.creerRecu(nouveauRecu);
        })
      );
    });

    forkJoin(missions).subscribe({
      next: () => {
        this.commandeService.changerStatutCommande(this.selectedCommande.id, 'Reçue').subscribe({
          next: () => {
            alert('🎉 Réception validée et commande clôturée !');
            this.router.navigate(['/stocks']);
          },
          error: (err) => {
            console.error("Erreur lors du changement de statut", err);
            alert("Lots créés, mais impossible de clôturer la commande.");
            this.isSubmitting = false;
          }
        });
      },
      error: (erreur) => {
        console.error('Aïe, erreur lors de la sauvegarde :', erreur);
        alert('Une erreur est survenue lors de la sauvegarde. Vérifiez la console.');
        this.isSubmitting = false;
      }
    });
  }

  resetFormulaire() {
    this.selectedCommande = null;
    this.lignesLots = [];
    this.notes = '';
    this.isSubmitting = false;
  }
}