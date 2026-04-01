import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // INDISPENSABLE pour le formulaire
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fournisseurs.html',
  styleUrl: './fournisseurs.css',
})


export class Fournisseurs implements OnInit {
  fournisseurs: any[] = [];
  showForm: boolean = false;
  vueDetails: boolean = false;
  fournisseurSelectionne: any = null;

  // Objet complet calqué sur ton image
  nouveauFournisseur = {
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    statut: 'Actif',
    // Partie Contact 
    contactPrenom: '',
    contactNom: ''
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.chargerFournisseurs();
  }

  chargerFournisseurs() {
    this.http.get<any>('http://localhost:8000/api/fournisseurs').subscribe(data => {
      this.fournisseurs = data.member || [];
      this.cdr.detectChanges();
    });
  }

  validerAjout() {
    console.log('🚀 Bouton cliqué ! Données :', this.nouveauFournisseur);
    const url = 'http://localhost:8000/api/fournisseurs';
  
  // On définit les headers pour API Platform
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/ld+json'
    })
  };

  // On passe les options en 3ème paramètre
  this.http.post(url, this.nouveauFournisseur, httpOptions).subscribe({
    next: (res) => {
      console.log(' Succès !', res);
      this.chargerFournisseurs();
      this.showForm = false;
    },
    error: (err) => {
      console.error(' Erreur détaillée :', err);
    }
  });

}

voirDetails(id: number) {
    const url = `http://localhost:8000/api/fournisseurs/${id}`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.fournisseurSelectionne = data;
        this.vueDetails = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur détails :', err)
    });
  }

  retourListe() {
    this.vueDetails = false;
    this.fournisseurSelectionne = null;
  }
}
