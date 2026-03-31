import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  // L'URL de ton backend Symfony
  private apiUrl = 'http://localhost:8000/api/produits';

  constructor(private http: HttpClient) { }

  getProduits(): Observable<any> {
    // On lance la requête GET vers Symfony
    return this.http.get<any>(this.apiUrl);
  }
}