import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../search'; // Vérifie le chemin vers ton service
import { HighlightPipe } from '../../highlight-pipe'; // Vérifie le chemin vers ton pipe

@Component({
  selector: 'app-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule, HighlightPipe], // AJOUT du HighlightPipe ici
  templateUrl: './fournisseurs.html',
  styleUrl: './fournisseurs.css',
})
export class Fournisseurs implements OnInit {
  fournisseurs: any[] = [];
  showForm: boolean = false;
  vueDetails: boolean = false;
  fournisseurSelectionne: any = null;
  
  // Variable pour stocker le mot de la barre de recherche
  motTape: string = '';

  nouveauFournisseur = {
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    statut: 'Actif',
    contactPrenom: '',
    contactNom: ''
  };

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private searchService: SearchService // Injection du service de recherche
  ) {}

  ngOnInit(): void {
    this.chargerFournisseurs();

    // ÉCOUTE de la barre de recherche globale
    this.searchService.currentSearch.subscribe(valeur => {
  this.motTape = valeur;
  // On force Angular à vérifier TOUS les composants de la page
  this.cdr.markForCheck(); 
  this.cdr.detectChanges(); 
});
  }

  chargerFournisseurs() {
    this.http.get<any>('http://localhost:8000/api/fournisseurs').subscribe(data => {
      // API Platform renvoie souvent les données dans "hydra:member" ou "member"
      this.fournisseurs = data['hydra:member'] || data.member || [];
      this.cdr.detectChanges();
    });
  }

  validerAjout() {
    const url = 'http://localhost:8000/api/fournisseurs';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/ld+json'
      })
    };

    this.http.post(url, this.nouveauFournisseur, httpOptions).subscribe({
      next: (res) => {
        this.chargerFournisseurs();
        this.showForm = false;
        // Reset du formulaire
        this.nouveauFournisseur = { nom: '', telephone: '', email: '', adresse: '', codePostal: '', ville: '', pays: 'France', statut: 'Actif', contactPrenom: '', contactNom: '' };
      },
      error: (err) => console.error('Erreur ajout :', err)
    });
  }

  voirDetails(id: number | string) {
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