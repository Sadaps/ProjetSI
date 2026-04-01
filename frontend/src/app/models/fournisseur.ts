export interface Fournisseur {
    id: number;
    nom: string;
}

export interface HydraResponse {
    'hydra:member': Fournisseur[];
    'hydra:totalItems': number;
}
