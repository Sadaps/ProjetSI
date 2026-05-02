import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- Ajout de ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande'; 
import { forkJoin, switchMap } from 'rxjs';
import { Router } from '@angular/router';

// 1. IMPORTS POUR LA RECHERCHE
import { SearchService } from '../../search'; // Vérifie le chemin
import { HighlightPipe } from '../../highlight-pipe'; // Vérifie le chemin

interface LigneReception {
  produitIri: string;
  nomProduit: string;
  nomScientifique: string;
  quantitePrevue: number;
  numeroLot: string;
  poidsReel: number | null;
  datePeremption: string;
}

@Component({
  selector: 'app-reception',
  standalone: true,
  // 2. AJOUT DU HIGHLIGHTPIPE DANS LES IMPORTS DU COMPOSANT
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

  // 3. VARIABLE POUR STOCKER LA RECHERCHE
  motTape: string = '';

  constructor(
    private commandeService: CommandeService, 
    private router: Router,
    private searchService: SearchService, // <-- 4. Injection du SearchService
    private cdr: ChangeDetectorRef        // <-- 5. Injection du ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.commandeService.getCommandes().subscribe({
      next: (reponseApi) => {
        const toutesLesCommandes = reponseApi.member || reponseApi['hydra:member'] || [];
        this.commandesEnAttente = toutesLesCommandes.filter((cmd: any) => cmd.statut !== 'Reçue');
        console.log('Commandes chargées depuis Symfony :', this.commandesEnAttente);
        this.isLoading = false; 
      },
      error: (erreur) => {
        console.error('Erreur lors du chargement des commandes', erreur);
        this.isLoading = false; 
      }
    });

    // 6. ÉCOUTE DE LA BARRE DE RECHERCHE GLOBALE
    this.searchService.currentSearch.subscribe(valeur => {
      this.motTape = valeur;
      this.cdr.markForCheck(); 
      this.cdr.detectChanges(); 
    });
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
        quantitePrevue: item.quantite,
        numeroLot: '',
        poidsReel: item.poids_attendu ? parseFloat(item.poids_attendu) : null, 
        datePeremption: ''
      };
    });
  }

  validerReception() {
    const formulaireIncomplet = this.lignesLots.some(ligne => !ligne.datePeremption);
    if (formulaireIncomplet) {
      alert("Veuillez remplir toutes les dates de péremption !");
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const missions = this.lignesLots.map(ligne => {
      const nouveauLot = {
        produit: ligne.produitIri, 
        quantite: ligne.quantitePrevue,
        poids: ligne.poidsReel !== null ? ligne.poidsReel.toString() : null,
        datePeremption: ligne.datePeremption,
        dateEntreeLot: this.dateReception
      };

      return this.commandeService.creerLot(nouveauLot).pipe(
        switchMap((lotCree: any) => {
          const nouveauRecu = {
            commande: `/api/commandes/${this.selectedCommande.id}`,
            lot: lotCree['@id'], 
            quantite: ligne.quantitePrevue,
            date_reception: this.dateReception,
            notes: this.notes
          };
          return this.commandeService.creerRecu(nouveauRecu);
        })
      );
    });

    forkJoin(missions).subscribe({
      next: (resultats) => {
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