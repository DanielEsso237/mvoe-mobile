import type {
  Arrondissement,
  Departement,
  FacilitateurAnnuaireEntry,
  Langue,
  Region,
} from "@/types";

export const MOCK_LANGUES: Langue[] = [
  { code: "fr", libelle: "Français", estDefaut: true },
  { code: "en", libelle: "English" },
  { code: "bulu", libelle: "Bulu" },
  { code: "ewondo", libelle: "Ewondo" },
];

export const MOCK_REGIONS: Region[] = [
  { id: "sud", nom: "Sud" },
  { id: "centre", nom: "Centre" },
];

export const MOCK_DEPARTEMENTS: Departement[] = [
  { id: "mvila", regionId: "sud", nom: "Mvila" },
  { id: "mfoundi", regionId: "centre", nom: "Mfoundi" },
];

export const MOCK_ARRONDISSEMENTS: Arrondissement[] = [
  { id: "ebolowa-1", departementId: "mvila", nom: "Ebolowa I" },
  { id: "ebolowa-2", departementId: "mvila", nom: "Ebolowa II" },
  { id: "yaounde-1", departementId: "mfoundi", nom: "Yaoundé I" },
];

export const MOCK_ANNUAIRE: FacilitateurAnnuaireEntry[] = [
  {
    id: "fac-1",
    nom: "Ateba Marie-Claire",
    telephone: "699 11 22 33",
    arrondissementId: "ebolowa-2",
    arrondissementNom: "Ebolowa II",
  },
  {
    id: "fac-2",
    nom: "Ndzana Léonie",
    telephone: "677 44 55 66",
    arrondissementId: "ebolowa-2",
    arrondissementNom: "Ebolowa II",
  },
  {
    id: "fac-3",
    nom: "Mballa Jean",
    telephone: "655 22 11 00",
    arrondissementId: "ebolowa-1",
    arrondissementNom: "Ebolowa I",
  },
];
