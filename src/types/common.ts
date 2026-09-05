export interface Langue {
  code: string;
  libelle: string;
  estDefaut?: boolean;
}

export interface Region {
  id: string;
  nom: string;
}

export interface Departement {
  id: string;
  regionId: string;
  nom: string;
}

export interface Arrondissement {
  id: string;
  departementId: string;
  nom: string;
}

export type NiveauPortee =
  | "national"
  | "region"
  | "departement"
  | "arrondissement";

export interface Portee {
  niveau: NiveauPortee;
  entiteId: string | null;
  libelle: string;
}

export interface FacilitateurAnnuaireEntry {
  id: string;
  nom: string;
  telephone: string;
  arrondissementId: string;
  arrondissementNom: string;
}
