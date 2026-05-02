import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande'; 
import { forkJoin, switchMap } from 'rxjs';
import { Router } from '@angular/router';

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
  imports: [CommonModule, FormsModule],
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
  // Empêche les doubles clics pendant l'envoi
  isSubmitting: boolean = false;

  constructor(private commandeService: CommandeService, private router: Router) {}

ngOnInit() {
    // La requête part, le HTML affiche le sablier (isLoading est à true)
    
    this.commandeService.getCommandes().subscribe({
      next: (reponseApi) => {
        // On sécurise avec || [] pour éviter les erreurs si l'API est vide
        const toutesLesCommandes = reponseApi.member || reponseApi['hydra:member'] || [];
        
        this.commandesEnAttente = toutesLesCommandes.filter((cmd: any) => cmd.statut !== 'Reçue');
        console.log('Commandes chargées depuis Symfony :', this.commandesEnAttente);
        
        // C'est bon, on a les données, on cache le message de chargement !
        this.isLoading = false; 
      },
      error: (erreur) => {
        console.error('Erreur lors du chargement des commandes', erreur);
        
        // En cas d'erreur (ex: serveur éteint), on arrête aussi le chargement
        // pour ne pas bloquer l'utilisateur sur un sablier infini.
        this.isLoading = false; 
      }
    });
  }

onCommandeChange() {
    if (!this.selectedCommande || !this.selectedCommande.contenir) {
      this.lignesLots = [];
      return;
    }

    this.lignesLots = this.selectedCommande.contenir.map((item: any) => {
      return {
        // On récupère le @id (qui contient déjà "/api/produits/X")
        produitIri: item.produit['@id'], 
        nomProduit: item.produit.nom,
        nomScientifique: item.produit.nomScientifique,
        quantitePrevue: item.quantite,
        numeroLot: '',
        // Au lieu de null, on met par défaut le poids attendu !
        // L'utilisateur pourra le modifier si le vrai poids mesuré est différent.
        poidsReel: item.poids_attendu ? parseFloat(item.poids_attendu) : null, 
        datePeremption: ''
      };
    });
  }

validerReception() {
    // 1. Validation : on vérifie les dates obligatoires
    const formulaireIncomplet = this.lignesLots.some(ligne => !ligne.datePeremption);
    if (formulaireIncomplet) {
      alert("Veuillez remplir toutes les dates de péremption !");
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    // 2. Préparation des missions (Requêtes)
    const missions = this.lignesLots.map(ligne => {
      
      const nouveauLot = {
        produit: ligne.produitIri, // <-- On utilise directement la bonne adresse !
        quantite: ligne.quantitePrevue,
        poids: ligne.poidsReel !== null ? ligne.poidsReel.toString() : null,
        datePeremption: ligne.datePeremption,
        dateEntreeLot: this.dateReception
      };

      return this.commandeService.creerLot(nouveauLot).pipe(
        switchMap((lotCree: any) => {
          
          // --- C'EST ICI QUE ÇA CHANGE ---
          const nouveauRecu = {
            commande: `/api/commandes/${this.selectedCommande.id}`,
            lot: lotCree['@id'], 
            quantite: ligne.quantitePrevue,
            date_reception: this.dateReception,
            notes: this.notes // 👈 ON AJOUTE LA NOTE ICI
          };
          // ---------------------------------

          return this.commandeService.creerRecu(nouveauRecu);
        })
      );
    });

    // 3. Exécution de toutes les requêtes
    forkJoin(missions).subscribe({
      next: (resultats) => {
        // LES LOTS SONT CRÉÉS ! Maintenant on met à jour la commande.
        this.commandeService.changerStatutCommande(this.selectedCommande.id, 'Reçue').subscribe({
          next: () => {
            alert('🎉 Réception validée et commande clôturée !');
            this.router.navigate(['/stocks']); // REDIRECTION
          },
          error: (err) => {
             console.error("Erreur lors du changement de statut", err);
             alert("Lots créés, mais impossible de clôturer la commande.");
             this.isSubmitting = false; // On débloque le bouton en cas d'erreur ici aussi
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