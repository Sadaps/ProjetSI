// On définit à quoi ressemble un Lot venant de l'API
export interface Lot {
  id: number;
  poids?: string;
  quantite: number;
  dateEntreeLot: string; 
  datePeremption: string;
}

// On met à jour le Produit pour inclure le tableau de lots
export interface Produit {
  id: number;
  nom: string;
  nomScientifique: string;
  fonction?: string;
  cosmos?: string;
  quantiteTotale?: number; // Nouvelle propriété pour stocker la quantité totale
  
  // 👉 Les deux propriétés magiques pour notre tableau :
  lots?: Lot[];          // Un produit peut contenir un tableau de lots
  isExpanded?: boolean;  // Sert uniquement pour ouvrir/fermer le tableau HTML
}