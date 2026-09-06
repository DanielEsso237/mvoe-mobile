import type { Campagne, ParametreCohorte } from "@/types";

// Campagnes et paramètres de cohorte : seules fonctionnalités superviseur
// encore mockées (campagnes est hors périmètre de cette étape — portée
// nationale MINPROFF, pas le superviseur d'arrondissement/terrain ; les
// paramètres de cohorte ont migré vers de vrais appels API, ce mock ne sert
// plus qu'à documenter la forme attendue si on le retéléphone plus tard).

export const MOCK_CAMPAGNES: Campagne[] = [
  {
    id: "camp-1",
    titre: "Rentrée scolaire et discipline positive",
    objet: "Sensibiliser sur les alternatives à la punition corporelle",
    statut: "en_cours",
    dateDebut: "2026-09-01",
    dateFin: "2026-10-15",
    modules: ["M2 — Discipline positive"],
    langues: ["fr", "en", "bulu"],
    regions: ["Sud", "Centre"],
    affectations: [
      { portee: "Région Sud", recues: 6, affectees: 8 },
      { portee: "Région Centre", recues: 3, affectees: 10 },
    ],
    jaiPrisConnaissance: false,
  },
  {
    id: "camp-2",
    titre: "Prévention des violences basées sur le genre",
    statut: "planifiee",
    dateDebut: "2026-10-01",
    dateFin: "2026-12-31",
    modules: ["M4 — Communication non violente"],
    langues: ["fr"],
    regions: ["Sud"],
    affectations: [{ portee: "Région Sud", recues: 0, affectees: 8 }],
    jaiPrisConnaissance: false,
  },
];

export const MOCK_PARAMETRES_COHORTES: ParametreCohorte[] = [
  { cohorteId: "coh-1", ratioMax: 25, effectifActuel: 22 },
  { cohorteId: "coh-2", ratioMax: 20, effectifActuel: 18 },
];
