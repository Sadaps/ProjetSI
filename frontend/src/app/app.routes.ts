import { Routes } from '@angular/router';
import { Tableaubord, } from './components/tableaubord/tableaubord';
import { Stocks } from './components/stocks/stocks';
import { Commandes } from './components/commandes/commandes';
import { Fournisseurs } from './components/fournisseurs/fournisseurs';
import { Reception } from './components/reception/reception';
import { Inventaires } from './components/inventaires/inventaires';

export const routes: Routes = [
  { path : '', redirectTo : 'tableaubord', pathMatch : 'full'}, 
  { path: 'tableaubord', component: Tableaubord },
  { path: 'stocks', component: Stocks },
  { path: 'commandes', component: Commandes },
  { path: 'fournisseurs', component: Fournisseurs },
  { path: 'reception', component: Reception },
  { path: 'inventaires', component: Inventaires },
];

