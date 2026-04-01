import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = 'http://localhost:8000/api'; // On raccourcit l'URL de base

  constructor(private http: HttpClient) {}

  getCommandes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/commandes`);
  }

  // --- NOUVELLES MÉTHODES ---

  creerLot(donneesLot: any): Observable<any> {
    // On envoie les données à /api/lots
    return this.http.post<any>(`${this.apiUrl}/lots`, donneesLot);
  }

  creerRecu(donneesRecu: any): Observable<any> {
    // On envoie les données à /api/recus
    return this.http.post<any>(`${this.apiUrl}/recus`, donneesRecu);
  }
}