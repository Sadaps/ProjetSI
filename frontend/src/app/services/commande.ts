import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // 1. Voici la fameuse fonction qui crée les étiquettes !
  private getOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/ld+json',
        'Accept': 'application/ld+json'
      })
    };
  }

  getCommandes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/commandes`, {
      headers: new HttpHeaders({ 'Accept': 'application/ld+json' })
    });
  }

  creerLot(donneesLot: any): Observable<any> {
    // 2. On colle l'étiquette sur le colis "Lot" en ajoutant this.getOptions() à la fin
    return this.http.post<any>(`${this.apiUrl}/lots`, donneesLot, this.getOptions());
  }

  creerRecu(donneesRecu: any): Observable<any> {
    // 3. On colle l'étiquette sur le colis "Reçu" 
    return this.http.post<any>(`${this.apiUrl}/recus`, donneesRecu, this.getOptions());
  }

  private getPatchOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/merge-patch+json', // <-- Très important pour API Platform !
        'Accept': 'application/ld+json'
      })
    };
  }

  // NOUVELLE FONCTION POUR METTRE À JOUR LA COMMANDE
  changerStatutCommande(idCommande: number, nouveauStatut: string): Observable<any> {
    const url = `${this.apiUrl}/commandes/${idCommande}`;
    const modification = { statut: nouveauStatut };
    
    return this.http.patch<any>(url, modification, this.getPatchOptions());
  }
}