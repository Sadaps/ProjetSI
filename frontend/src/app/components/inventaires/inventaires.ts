import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventaires',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventaires.html',
  styleUrl: './inventaires.css'
})
export class Inventaires implements OnInit {
  inventaires: any[] = [];
  chargement: boolean = true;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef // <-- Ajout du ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 Lancement de la requête API pour les inventaires...');

    this.http.get<any>('http://127.0.0.1:8000/api/inventaires').subscribe({
      next: (data) => {
        console.log('✅ Données reçues de l\'API :', data); // On affiche les données dans la console
        
        // On récupère les données selon le format d'API Platform
        this.inventaires = data['hydra:member'] || data.member || data || [];
        this.chargement = false;
        
        this.cdr.detectChanges(); // <-- On force la mise à jour du HTML
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement :', err);
        this.chargement = false;
        
        this.cdr.detectChanges(); // <-- On force la mise à jour même en cas d'erreur
      }
    });
  }

  retourStocks(): void {
    this.router.navigate(['/stocks']);
  }
}