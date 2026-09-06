import { apiRequest } from "@/services/api/client";

/**
 * Types calqués sur la forme JSON EXACTE renvoyée par le serveur de
 * référence (`App\Http\Controllers\Api\Superviseur\*`, voir
 * ../mvoe/routes/api.php, groupe `prefix('superviseur')`). En snake_case et
 * non retravaillés : la traduction vers les types locaux (camelCase, voir
 * `src/types/superviseur.ts`) se fait dans `src/services/superviseur.ts`.
 */

export interface PorteeServeur {
  niveau: string;
  libelle: string;
  arrondissements: number;
}

export interface IndicateursServeur {
  facilitateurs_formes: number;
  facilitateurs_actifs: number;
  facilitateurs_jamais_actifs: number;
  cohortes: number;
  parents_inscrits: number;
  seances_tenues: number;
  /** Nul quand la portée n'a encore aucune séance à moyenner. */
  dose_moyenne_par_parent: number | null;
  ecarts_releves: number;
  /** Nul quand la portée n'a encore aucune remontée à moyenner. */
  delai_moyen_remontee_jours: number | null;
  activites: number;
  parents_touches: number;
  dont_hommes: number;
  dont_femmes: number;
  participants_handicap: number;
  foyers_suivis: number;
  foyers_avec_difficulte: number;
  groupes_soutien: number;
  groupes_actifs: number;
  signalements: number;
  signalements_a_traiter: number;
  modules_formation_ouverts: number;
  facilitateurs_en_formation: number;
}

export interface DecoupageLigneServeur extends IndicateursServeur {
  id: number;
  libelle: string;
  peuplee: boolean;
  actif?: boolean;
  jours_depuis_activite?: number | null;
}

export interface TableauDeBordServeur {
  portee: PorteeServeur;
  indicateurs: IndicateursServeur;
  decoupage: { niveau: string; libelle: string; lignes: DecoupageLigneServeur[] } | null;
  seuil_inactivite_jours: number;
  fil: { niveau: string | null; entite: number | null; libelle: string }[];
}

export async function getTableauDeBordEnLigne(
  jeton: string,
  filtre?: { niveau?: string; entite?: number }
): Promise<TableauDeBordServeur> {
  const params = new URLSearchParams();
  if (filtre?.niveau) params.set("niveau", filtre.niveau);
  if (filtre?.entite !== undefined) params.set("entite", String(filtre.entite));
  const suffixe = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<TableauDeBordServeur>(`/superviseur/tableau-de-bord${suffixe}`, {
    method: "GET",
    token: jeton,
  });
}

export interface FacilitateurRegistreServeur {
  id: number;
  nom: string;
  telephone: string;
  arrondissement: string;
  departement: string;
  type_juridique: string;
  organisation_rattachement: string | null;
  date_formation_initiale: string;
  derniere_activite: string | null;
  jours_depuis_activite: number | null;
  seances_animees: number;
  actif: boolean;
  modules_ouverts: number;
  modules_termines: number;
  derniere_formation: string | null;
}

export interface RegistreServeur {
  portee: PorteeServeur;
  synthese: {
    formes: number;
    actifs: number;
    inactifs: number;
    jamais_actifs: number;
    modules_diffusables: number;
    seuil_inactivite_jours: number;
  };
  facilitateurs: FacilitateurRegistreServeur[];
}

export async function getRegistreEnLigne(
  jeton: string,
  arrondissementId?: number
): Promise<RegistreServeur> {
  const suffixe = arrondissementId ? `?arrondissement_id=${arrondissementId}` : "";
  return apiRequest<RegistreServeur>(`/superviseur/facilitateurs${suffixe}`, {
    method: "GET",
    token: jeton,
  });
}

export async function getTypesJuridiquesEnLigne(
  jeton: string
): Promise<{ valeur: string; libelle: string }[]> {
  const reponse = await apiRequest<{ types: { valeur: string; libelle: string }[] }>(
    "/superviseur/types-juridiques",
    { method: "GET", token: jeton }
  );
  return reponse.types;
}

export interface EnregistrerFacilitateurServeurInput {
  nom: string;
  telephone: string;
  email?: string;
  type_juridique: string;
  organisation_rattachement?: string;
  date_formation_initiale: string;
}

export interface IdentifiantsServeur {
  telephone: string;
  code_appareil: string;
  email?: string;
  mot_de_passe: string;
}

export interface EnregistrerFacilitateurReponseServeur {
  facilitateur: {
    id: number;
    nom: string;
    arrondissement: string;
    type_juridique: string;
    date_formation_initiale: string;
  };
  identifiants: IdentifiantsServeur;
  avertissement: string;
}

export async function enregistrerFacilitateurEnLigne(
  jeton: string,
  input: EnregistrerFacilitateurServeurInput
): Promise<EnregistrerFacilitateurReponseServeur> {
  return apiRequest<EnregistrerFacilitateurReponseServeur>("/superviseur/facilitateurs", {
    method: "POST",
    token: jeton,
    body: input,
  });
}

export async function regenererIdentifiantsEnLigne(
  jeton: string,
  facilitateurId: number
): Promise<{ identifiants: IdentifiantsServeur; avertissement: string }> {
  return apiRequest(`/superviseur/facilitateurs/${facilitateurId}/identifiants`, {
    method: "POST",
    token: jeton,
  });
}

export interface CohorteSuperviseurServeur {
  id: number;
  libelle: string;
  arrondissement: string;
  date_debut: string;
  facilitateur: string | null;
  effectif: number;
  seances_tenues: number;
  ratio_max: number;
  places_restantes: number;
  effectif_au_dela_du_plafond: number;
}

export async function getCohortesSuperviseurEnLigne(
  jeton: string
): Promise<{ portee: PorteeServeur; cohortes: CohorteSuperviseurServeur[] }> {
  return apiRequest("/superviseur/cohortes", { method: "GET", token: jeton });
}

export async function patchRatioCohorteEnLigne(
  jeton: string,
  cohorteId: number,
  ratioMax: number
): Promise<{
  cohorte: CohorteSuperviseurServeur;
  modification: { ratio_max: { avant: number; apres: number } };
}> {
  return apiRequest(`/superviseur/cohortes/${cohorteId}`, {
    method: "PATCH",
    token: jeton,
    body: { ratio_max: ratioMax },
  });
}

export interface RapportServeur {
  portee: PorteeServeur;
  periode: { annee: number; trimestre: number; du: string; au: string };
  synthese: {
    seances_tenues: number;
    cohortes_actives: number;
    facilitateurs_ayant_anime: number;
    facilitateurs_formes: number;
    facilitateurs_actifs: number;
    dose_moyenne_par_parent: number | null;
    delai_moyen_remontee_jours: number | null;
    ecarts_total: number;
  };
  cohortes: {
    libelle: string;
    arrondissement: string;
    ratio_max: number;
    effectif: number;
    places_restantes: number;
    seances_tenues: number;
  }[];
  facilitateurs: {
    nom: string;
    arrondissement: string;
    seances: number;
    sequences_declarees_realisees: number;
    ecarts: number;
    declarees_jamais_ouvertes: number;
    ouvertes_declarees_non_faites: number;
    delai_moyen_remontee_jours: number | null;
  }[];
}

export async function getRapportEnLigne(
  jeton: string,
  annee: number,
  trimestre: 1 | 2 | 3 | 4
): Promise<RapportServeur> {
  return apiRequest<RapportServeur>(
    `/superviseur/rapport?annee=${annee}&trimestre=${trimestre}`,
    { method: "GET", token: jeton }
  );
}

export interface SignalementServeur {
  id: number;
  uuid: string;
  type: string;
  type_libelle: string;
  gravite: string;
  gravite_libelle: string;
  statut: string;
  statut_libelle: string;
  ouvert: boolean;
  arrondissement: string;
  facilitateur: string;
  soumis_le: string;
  jours_attente: number;
  traite_par: string | null;
  date_traitement: string | null;
  suite_donnee: string | null;
}

export async function getSignalementsSuperviseurEnLigne(jeton: string): Promise<{
  portee: PorteeServeur;
  synthese: {
    total: number;
    a_traiter: number;
    graves_non_traites: number;
    delai_moyen_traitement_jours: number;
  };
  signalements: SignalementServeur[];
}> {
  return apiRequest("/superviseur/signalements", { method: "GET", token: jeton });
}
