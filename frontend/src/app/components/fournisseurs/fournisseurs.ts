import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
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
  isEditingFournisseur: boolean = false;
  fournisseurEnCoursDeditionId: number | null = null;
  
  vueDetails: boolean = false;
  fournisseurSelectionne: any = null;
  showContactForm = false;
  isEditingContact = false;
  contactEnCoursDeditionId: number | null = null;
  fonctions: any[] = [];

  private apiUrl = 'http://127.0.0.1:8000/api';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/ld+json'
    })
  };

  nouveauFournisseur = {
    nom: '',
    telephone: '',
    mail: '',
    adresse: '',
    codePostal: '', // Initialisé ici
    ville: '',
    pays: 'France'
  };

  nouveauContact = {
    nom: '',
    prenom: '',
    mail: '',
    telephone: '',
    statut: true,
    fonctionId: null
  };

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.chargerFournisseurs();
    this.chargerFonctions();
  }

  get totalContactsGlobal(): number {
    return this.fournisseurs.reduce((acc, f) => acc + (f.contact ? f.contact.length : 0), 0);
  }

  chargerFournisseurs() {
    this.http.get<any>(`${this.apiUrl}/fournisseurs`).subscribe(data => {
      this.fournisseurs = data['hydra:member'] || data.member || [];
      this.cdr.detectChanges();
    });
  }
  //confirmation de l'ajout d'un fournisseur ou de la modification d'un fournisseur, en fonction du contexte (ajout "this.nouveauFournisseur" ou modification "this.fournisseurEnCoursDeditionId")
  validerAjout() {
    if (this.isEditingFournisseur && this.fournisseurEnCoursDeditionId) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
      this.http.patch(`${this.apiUrl}/fournisseurs/${this.fournisseurEnCoursDeditionId}`, this.nouveauFournisseur, { headers }).subscribe({
        next: () => {
          this.chargerFournisseurs();
          this.fermerFormulaireFournisseur();
        },
        error: (err) => console.error('Erreur modification fournisseur :', err)
      });
    } else {
      this.http.post(`${this.apiUrl}/fournisseurs`, this.nouveauFournisseur, this.httpOptions).subscribe({
        next: () => {
          this.chargerFournisseurs();
          this.fermerFormulaireFournisseur();
        },
        error: (err) => console.error('Erreur ajout fournisseur :', err)
      });
    }
  }

  modifierFournisseur(f: any) {
    this.isEditingFournisseur = true;
    this.showForm = true;
    this.fournisseurEnCoursDeditionId = f.id;
    this.nouveauFournisseur = { 
      nom: f.nom, 
      telephone: f.telephone, 
      mail: f.mail, 
      adresse: f.adresse, 
      codePostal: f.codePostal || '', 
      ville: f.ville, 
      pays: f.pays 
    };
  }

  supprimerFournisseur(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
      this.http.delete(`${this.apiUrl}/fournisseurs/${id}`).subscribe({
        next: () => this.chargerFournisseurs(),
        error: (err) => console.error('Erreur suppression fournisseur :', err)
      });
    }
  }

  fermerFormulaireFournisseur() {
    this.showForm = false;
    this.isEditingFournisseur = false;
    this.fournisseurEnCoursDeditionId = null;
    this.nouveauFournisseur = { nom: '', telephone: '', mail: '', adresse: '', codePostal: '', ville: '', pays: 'France' };
  }
 // Fonctions pour charger toutes les fonctions (pour les contacts) pour les afficher et les lister dans le formulaire d'ajout/modification de contact
  chargerFonctions() {
    this.http.get<any>(`${this.apiUrl}/fonctions`).subscribe({
      next: (data) => {
        this.fonctions = data['hydra:member'] || data.member || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur fonctions :', err)
    });
  }

  // Permet d'afficehr les details d'un fournisseur, notamment la liste de ses contacts et les informations associées
  voirDetails(id: number) {
    this.http.get<any>(`${this.apiUrl}/fournisseurs/${id}`).subscribe({
      next: (data) => {
        this.fournisseurSelectionne = data;
        this.vueDetails = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur détails :', err)
    });
  }

  validerAjoutContact() {
    const contactAPost = {
      prenom: this.nouveauContact.prenom,
      nom: this.nouveauContact.nom,
      mail: this.nouveauContact.mail,
      telephone: this.nouveauContact.telephone,
      statut: this.nouveauContact.statut ? "1" : "0",
      fournisseur: `/api/fournisseurs/${this.fournisseurSelectionne.id}`,
      fonction: this.nouveauContact.fonctionId ? `/api/fonctions/${this.nouveauContact.fonctionId}` : null
    };

    this.http.post(`${this.apiUrl}/contacts`, contactAPost, this.httpOptions).subscribe({
      next: () => {
        this.voirDetails(this.fournisseurSelectionne.id);
        this.annulerEdition();
      },
      error: (err) => console.error('Erreur ajout contact :', err)
    });
  }

  modifierContact(c: any) {
    this.isEditingContact = true;
    this.showContactForm = true;
    this.contactEnCoursDeditionId = c.id;
    this.nouveauContact = { 
      prenom: c.prenom, 
      nom: c.nom, 
      mail: c.mail, 
      telephone: c.telephone,
      statut: c.statut === "1" || c.statut === true,
      fonctionId: c.fonction ? c.fonction.id : null 
    };
  }

  validerModificationContact() {
    const url = `${this.apiUrl}/contacts/${this.contactEnCoursDeditionId}`;
    const contactAPatch = {
      prenom: this.nouveauContact.prenom,
      nom: this.nouveauContact.nom,
      mail: this.nouveauContact.mail,
      telephone: this.nouveauContact.telephone,
      statut: this.nouveauContact.statut ? "1" : "0",
      fonction: this.nouveauContact.fonctionId ? `/api/fonctions/${this.nouveauContact.fonctionId}` : null
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });

    this.http.patch(url, contactAPatch, { headers }).subscribe({
      next: () => {
        this.voirDetails(this.fournisseurSelectionne.id);
        this.annulerEdition();
      },
      error: (err) => console.error('Erreur modification contact :', err)
    });
  }

  
  supprimerContact(contactId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      this.http.delete(`${this.apiUrl}/contacts/${contactId}`).subscribe({
        next: () => {
          this.fournisseurSelectionne.contact = this.fournisseurSelectionne.contact.filter((c: any) => c.id !== contactId);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur suppression :', err)
      });
    }
  }

  annulerEdition() {
    this.isEditingContact = false;
    this.showContactForm = false;
    this.contactEnCoursDeditionId = null;
    this.nouveauContact = { nom: '', prenom: '', mail: '', telephone: '', statut: true, fonctionId: null };
  }

  retourListe() {
    this.vueDetails = false;
    this.fournisseurSelectionne = null;
    this.chargerFournisseurs();
  }
}