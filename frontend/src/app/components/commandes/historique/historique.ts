import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { CommandeService } from '../../../services/commande'; 
// import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique.html', 
  styleUrl: './historique.css'
})
export class Historique implements OnInit {
  toutesLesCommandes: any[] = [];   
  commandesAffichees: any[] = [];   
  isLoading: boolean = true;
  commandeSelectionnee: any = null;

  motRecherche: string = '';
  statutSelectionne: string = ''; 

  constructor(
    private commandeService: CommandeService,
    private cdr: ChangeDetectorRef
    // private searchService: SearchService 
  ) {}

  ngOnInit() {
    this.chargerCommandes();
  }

  chargerCommandes() {
    this.commandeService.getCommandes().subscribe({
      next: (reponseApi) => {
        this.toutesLesCommandes = reponseApi.member || reponseApi['hydra:member'] || [];
        
        this.commandesAffichees = [...this.toutesLesCommandes].sort((a, b) => 
          new Date(b.date_commande).getTime() - new Date(a.date_commande).getTime()
        );
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'historique', err);
        this.isLoading = false;
      }
    });
  }

  calculerDelaiCommande(commande: any): string {
    if (!commande.contenir || commande.contenir.length === 0) {
      return 'Non défini';
    }

    let maxDelaiMin = 0;
    let maxDelaiMax = 0;

    const idFournisseurCommande = commande.fournisseur['@id'];

    for (const ligne of commande.contenir) {
      if (ligne.produit && ligne.produit.fournisPar && Array.isArray(ligne.produit.fournisPar)) {
        const infoFournisseur = ligne.produit.fournisPar.find((fp: any) => {
           return fp.fournisseur['@id'] === idFournisseurCommande;
        });

        if (infoFournisseur) {
          const min = parseInt(infoFournisseur.delai_min, 10);
          const max = parseInt(infoFournisseur.delai_max, 10);

          if (!isNaN(min) && min > maxDelaiMin) {
            maxDelaiMin = min;
          }
          if (!isNaN(max) && max > maxDelaiMax) {
            maxDelaiMax = max;
          }
        }
      }
    }

    if (maxDelaiMin === 0 && maxDelaiMax === 0) {
      return 'Non défini';
    }

    return `${maxDelaiMin} à ${maxDelaiMax} j`;
  }

  appliquerFiltres() {
    this.commandesAffichees = this.toutesLesCommandes.filter(cmd => {
      const correspondStatut = this.statutSelectionne === '' || cmd.statut === this.statutSelectionne;
      const nomFournisseur = cmd.fournisseur?.nom?.toLowerCase() || '';
      const idCommande = cmd.id?.toString() || '';
      const correspondRecherche = nomFournisseur.includes(this.motRecherche) || idCommande.includes(this.motRecherche);
      return correspondStatut && correspondRecherche;
    });
  }

  ouvrirDetail(commande: any) {
    this.commandeSelectionnee = commande;
    this.cdr.detectChanges();
  }

  fermerDetail() {
    this.commandeSelectionnee = null;
    this.cdr.detectChanges();
  }

  getPrixUnitaire(ligne: any, idFournisseur: string): number {
    if (!ligne.produit || !ligne.produit.fournisPar) return 0;

    const fp = ligne.produit.fournisPar.find((f: any) => {
      const idF = f.fournisseur['@id'] || f.fournisseur.id || f.fournisseur;
      return idF === idFournisseur;
    });

    return fp ? parseFloat(fp.prix) : 0;
  }

  // --- NOUVELLE FONCTION POUR AFFICHER LA QUANTITÉ AVEC LA BONNE UNITÉ ---
  afficherQuantiteFormatee(ligne: any): string {
    const quantite = parseFloat(ligne.quantite);
    const unite = ligne.produit?.unite; 

    if (!quantite) return '0';

    if (unite === 'g') {
      return quantite.toLocaleString('fr-FR') + ' g';
    } else if (unite === 'ml') {
      return quantite.toLocaleString('fr-FR') + ' ml';
    } else {
      return quantite.toLocaleString('fr-FR') + ' pce(s)';
    }
  }

  calculerTotalLigne(ligne: any, idFournisseur: string): number {
    const quantite = parseFloat(ligne.quantite);
    const prixUnitaire = this.getPrixUnitaire(ligne, idFournisseur);
    const unite = ligne.produit?.unite;

    if (unite === 'g' || unite === 'ml') {
      // Si c'est en g ou ml, le prix est au kilo ou au litre, donc on divise la quantité par 1000
      return (quantite / 1000) * prixUnitaire;
    } else {
      return quantite * prixUnitaire;
    }
  }

  annulerCommande(commande: any) {
    // 1. On demande confirmation à l'utilisateur
    const confirmation = window.confirm(`Êtes-vous sûr de vouloir annuler la commande #${commande.id} ? Cette action est irréversible.`);
    
    // 2. S'il clique sur "OK", on lance l'annulation
    if (confirmation) {
      this.commandeService.changerStatutCommande(commande.id, 'Annulée').subscribe({
        next: () => {
          // On met à jour visuellement le statut pour que l'interface réagisse tout de suite
          commande.statut = 'Annulée';
          
          alert('✅ La commande a été annulée avec succès.');
          
          // On ferme la fenêtre de détails
          this.fermerDetail();
          
          // On rafraîchit la liste pour que la commande passe dans le bon filtre
          this.appliquerFiltres();
        },
        error: (err) => {
          console.error("Erreur lors de l'annulation :", err);
          alert("Aïe, une erreur est survenue lors de l'annulation de la commande. Vérifiez la console.");
        }
      });
    }
  }
}