export interface Produit {
  id?: number;
  nom: string;
  nomScientifique: string; // API Platform transforme automatiquement le "nom_scientifique" de PHP en "nomScientifique" (camelCase) en JSON !
  fonction?: string;
  cosmos?: string;
}