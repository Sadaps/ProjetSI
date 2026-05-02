import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // On crée une "boîte" qui contient le texte recherché (vide au début)
  private searchSubject = new BehaviorSubject<string>('');
  
  // On crée un "écouteur" pour que les pages puissent voir ce qu'il y a dans la boîte
  currentSearch = this.searchSubject.asObservable();

  constructor() { }

  // Cette fonction permet de mettre un nouveau texte dans la boîte
  updateSearch(query: string) {
    this.searchSubject.next(query);
  }
}