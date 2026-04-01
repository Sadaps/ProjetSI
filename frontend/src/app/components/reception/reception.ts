import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande'; // ⚠️ Vérifie que le chemin est bon !
import { forkJoin, switchMap } from 'rxjs';

interface LigneReception {
  produitId: number;
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

  // 1. On injecte le service dans le constructeur
  constructor(private commandeService: CommandeService) {}

  ngOnInit() {
    // 2. On demande au service d'aller chercher les commandes
    this.commandeService.getCommandes().subscribe({
      next: (reponseApi) => {
        // API Platform range la liste dans un tableau nommé "member" (ou "hydra:member")
        this.commandesEnAttente = reponseApi.member || reponseApi['hydra:member'];
        console.log('Commandes chargées depuis Symfony :', this.commandesEnAttente);
      },
      error: (erreur) => {
        console.error('Erreur lors du chargement des commandes', erreur);
      }
    });
  }

  onCommandeChange() {
    if (!this.selectedCommande || !this.selectedCommande.contenir) {
      this.lignesLots = [];
      return;
    }

    // 3. On transforme les données de Symfony en lignes pour notre formulaire
    this.lignesLots = this.selectedCommande.contenir.map((item: any) => {
      return {
        produitId: item.produit.id,
        nomProduit: item.produit.nom,
        nomScientifique: item.produit.nomScientifique,
        quantitePrevue: item.quantite,
        numeroLot: '',
        poidsReel: null,
        datePeremption: ''
      };
    });
  }

 validerReception() {
    // On vérifie que la date de péremption est bien remplie pour chaque lot
    const formulaireIncomplet = this.lignesLots.some(ligne => !ligne.datePeremption);
    if (formulaireIncomplet) {
      alert("Veuillez remplir toutes les dates de péremption !");
      return;
    }

  // On prépare une liste de "missions" (requêtes HTTP)
    const missions = this.lignesLots.map(ligne => {
      
      // A. On prépare le paquet pour créer le Lot
      const nouveauLot = {
        produit: `/api/produits/${ligne.produitId}`,
        quantite: ligne.quantitePrevue,
        poids: ligne.poidsReel ? ligne.poidsReel.toString() : null,
        datePeremption: ligne.datePeremption,
        dateEntreeLot: this.dateReception
      };

// B. On lance la création du Lot, PUIS (switchMap) on crée le Reçu
      return this.commandeService.creerLot(nouveauLot).pipe(
        switchMap((lotCree: any) => {
          
          // Le lot est créé ! Symfony nous a renvoyé son adresse (@id)
          const nouveauRecu = {
            commande: `/api/commandes/${this.selectedCommande.id}`,
            lot: lotCree['@id'], // On lie avec le lot tout neuf !
            quantite: ligne.quantitePrevue,
            date_reception: this.dateReception
          };

          return this.commandeService.creerRecu(nouveauRecu);
        })
      );
    });
// C. On exécute toutes les missions en même temps !
    forkJoin(missions).subscribe({
      next: (resultats) => {
        alert('🎉 Réception validée ! Les lots ont été créés en base de données.');
        
        // On nettoie l'écran pour la prochaine commande
        this.selectedCommande = null;
        this.lignesLots = [];
        this.notes = '';
      },
      error: (erreur) => {
        console.error('Aïe, erreur lors de la sauvegarde :', erreur);
        alert('Une erreur est survenue lors de la sauvegarde.');
      }
    });
  }
  }