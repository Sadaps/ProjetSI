import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// On importe le service et le modèle depuis TES fichiers
import { ProduitService } from './services/produit'; 
import { Produit } from './models/produits.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html', // <-- On dit à Angular d'utiliser ton fichier HTML !
  styleUrl: './app.css'
})
export class App implements OnInit {
  produits: Produit[] = [];

  constructor(private produitService: ProduitService) {}

 ngOnInit(): void {
    this.produits = []; // On s'assure qu'au départ, c'est un tableau vide

    this.produitService.getProduits().subscribe({
      next: (data) => {
        // LE MOUCHARD : On affiche dans la console ce que Symfony a VRAIMENT répondu
        console.log('🕵️ Réponse brute de Symfony :', data); 
        
        // On récupère les données, ou on met un tableau vide si ça n'existe pas
        this.produits = data.member || data['hydra:member'] || []; 
      },
      error: (err) => {
        // LE MOUCHARD D'ERREUR
        console.error('🚨 Aïe, la requête a échoué :', err);
      }
    });
  }
}