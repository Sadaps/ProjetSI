import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { stat } from 'node:fs';

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
  showContactForm = false;
  isEditingContact = false;
  contactEnCoursDeditionId: number | null = null;

  // URL de base pour éviter les erreurs de frappe
  private apiUrl = 'http://127.0.0.1:8000/api';

  // Options pour API Platform (CM8)
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
    codePostal: '',
    ville: '',
    pays: 'France',
    statut: 'Actif'
  };

  nouveauContact = {
    nom: '',
    prenom: '',
    mail: '',
    telephone: '',
    statut: true
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.chargerFournisseurs();
  }

  chargerFournisseurs() {
    this.http.get<any>(`${this.apiUrl}/fournisseurs`).subscribe(data => {
      // Dans API Platform, la liste est dans 'hydra:member' (CM4)
      this.fournisseurs = data['hydra:member'] || data.member || [];
      this.cdr.detectChanges();
    });
  }

  validerAjout() {
    this.http.post(`${this.apiUrl}/fournisseurs`, this.nouveauFournisseur, this.httpOptions).subscribe({
      next: () => {
        this.chargerFournisseurs();
        this.showForm = false;
        // Reset du formulaire
        this.nouveauFournisseur = { nom: '', telephone: '', mail: '', adresse: '', codePostal: '', ville: '', pays: 'France', statut: 'Actif' };
      },
      error: (err) => console.error('Erreur ajout fournisseur :', err)
    });
  }

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
    ...this.nouveauContact,
    fournisseur: `/api/fournisseurs/${this.fournisseurSelectionne.id}`,
    // On transforme le booléen en string ("1" ou "0") pour faire correspondre à l'API Symfony sinon avec True/False a ne fonctione pas 
    statut: this.nouveauContact.statut ? "1" : "0" 
  };

  this.http.post(`${this.apiUrl}/contacts`, contactAPost, this.httpOptions).subscribe({
    next: () => {
      this.voirDetails(this.fournisseurSelectionne.id);
      this.annulerEdition();
    },
    error: (err) => console.error('Erreur :', err)
  });
}
  retourListe() {
    this.vueDetails = false;
    this.fournisseurSelectionne = null;
  }

  supprimerContact(contactId: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ? Ce contact ne pourra plus être récuperer')) {
    this.http.delete(`${this.apiUrl}/contacts/${contactId}`).subscribe({
      next: () => {
        // Mise à jour locale : on filtre le tableau pour enlever le contact supprimé
        this.fournisseurSelectionne.contact = this.fournisseurSelectionne.contact.filter(
          (c: any) => c.id !== contactId
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        alert('Impossible de supprimer le contact.');
      }
    });
  }
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
    statut: c.statut === "1"  // ça permet de convertir en boolean pour le formulaire (true si "1", false sinon)
  };
}

validerModificationContact() {
  const url = `${this.apiUrl}/contacts/${this.contactEnCoursDeditionId}`;
  
  // On prépare l'objet avec la conversion du statut en string
  const contactAPatch = {
    ...this.nouveauContact,
    statut: this.nouveauContact.statut ? "1" : "0"
  };


  const headers = new HttpHeaders({
    'Content-Type': 'application/merge-patch+json'
  });

  this.http.patch(url, contactAPatch, { headers }).subscribe({
    next: () => {
      console.log('Modification réussie !');
      // On rafraîchit les données du fournisseur pour voir le changement
      this.voirDetails(this.fournisseurSelectionne.id);
      this.annulerEdition();
    },
    error: (err) => {
      console.error('Erreur modification :', err);
      if (err.error && err.error['hydra:description']) {
        alert("Erreur : " + err.error['hydra:description']);
      }
    }
  });
}


annulerEdition() {
  this.isEditingContact = false;
  this.showContactForm = false;
  this.contactEnCoursDeditionId = null;
  this.nouveauContact = { nom: '', prenom: '', mail: '', telephone: '' , statut: true };
}
}