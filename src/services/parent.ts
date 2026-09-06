import { getJetonApiParent } from "@/db/repositories/auth";
import {
  getAnnuaireEnLigne,
  getArrondissementsEnLigne,
  getFeuilletonsEnLigne,
  getLanguesEnLigne,
  getModulesEnLigne,
  getQuestionsEnLigne,
  getSituationsEnLigne,
  getUniteEnLigne,
  getUnitesEnLigne,
  poserAssistantEnLigne,
  repondreQuestionEnLigne,
  type ModaliteServeur,
} from "@/services/api/parentDonnees";
import type {
  Arrondissement,
  AssistantReponse,
  FacilitateurAnnuaireEntry,
  Feuilleton,
  Langue,
  Modalite,
  ModuleCatalogue,
  QuestionSemaine,
  SituationFrequente,
  UniteDetail,
  UniteResume,
} from "@/types";

/**
 * Presque tout l'espace parent est public côté serveur (voir
 * ../mvoe/routes/api.php, groupe `prefix('parent')`) — pas de duplication
 * SQLite ici, comme pour le superviseur : de vrais appels API directs. Seule
 * `repondreQuestion` exige un jeton (compte ouvert), et aucune de ces
 * écritures ne mérite une file d'attente : l'utilisateur attend une réponse
 * à l'écran, un envoi différé ne servirait à rien.
 */

function versModalite(modalite: Modalite): ModaliteServeur {
  return modalite === "texte" ? "texte_picto" : "audio";
}

export async function getLangues(): Promise<Langue[]> {
  const langues = await getLanguesEnLigne();
  return langues.map((l) => ({ code: l.code, libelle: l.nom }));
}

export async function getModules(): Promise<ModuleCatalogue[]> {
  const modules = await getModulesEnLigne();
  return modules.map((m) => ({
    id: m.id,
    numero: m.numero,
    titre: m.titre,
    unitesCount: m.unites,
    renseigne: m.renseigne,
  }));
}

export async function getUnites(
  moduleId: number,
  langue: string
): Promise<UniteResume[]> {
  const reponse = await getUnitesEnLigne(moduleId, langue);
  return reponse.unites.map((u) => ({
    id: String(u.id),
    moduleNumero: reponse.module.numero,
    titre: u.titre,
    langueServie: u.langue_servie.code,
    languesDisponibles: reponse.langues_disponibles.map((l) => l.code),
  }));
}

export async function getUnite(
  uniteId: string,
  modalite: Modalite,
  langue: string
): Promise<UniteDetail | undefined> {
  const u = await getUniteEnLigne(Number(uniteId), langue, versModalite(modalite));
  return {
    id: String(u.id),
    moduleNumero: 0,
    titre: u.realisation?.titre ?? u.message_cle,
    contenuTexte: u.realisation?.contenu_texte ?? undefined,
    fichierAudio: u.realisation?.fichier_audio ?? undefined,
    pictogrammes: u.realisation?.pictogrammes ?? undefined,
    langueServie: u.langue_servie.code,
    langueDeRepli: u.langue_de_repli,
    modalitesDisponibles: u.modalites_disponibles.map((m) =>
      m === "texte_picto" ? "texte" : "audio"
    ),
  };
}

export async function getFeuilletons(langue: string): Promise<Feuilleton> {
  const { langueDeRepli, feuilletons } = await getFeuilletonsEnLigne(langue);
  // Le serveur autorise plusieurs feuilletons en parallèle ; cet écran n'en
  // affiche qu'un seul pour l'instant, comme au temps du mock.
  const f = feuilletons[0];
  return {
    titre: f?.titre ?? "",
    resume: f?.resume ?? "",
    langue: f?.langue ?? langue,
    langueDeRepli,
    episodes: (f?.episodes ?? []).map((e) => ({
      numero: e.numero,
      titre: e.titre,
      dureeSecondes: e.duree_secondes,
      dureeLisible: e.duree_lisible,
      fichierAudio: e.fichier_audio,
    })),
  };
}

export async function getQuestions(): Promise<QuestionSemaine[]> {
  const questions = await getQuestionsEnLigne();
  return questions.map((q) => ({
    id: String(q.id),
    enonce: q.enonce,
    enonceAudio: q.enonce_audio ?? undefined,
    explication: q.explication,
    reference: q.reference,
    options: q.options.map((o) => ({
      id: String(o.id),
      libelle: o.libelle,
      pictogramme: o.pictogramme ?? undefined,
    })),
  }));
}

export async function repondreQuestion(
  parentId: string,
  questionId: string,
  optionId: string
): Promise<void> {
  const jeton = await getJetonApiParent(parentId);
  if (!jeton) return;
  await repondreQuestionEnLigne(jeton, Number(questionId), Number(optionId));
}

export async function getSituations(langue: string): Promise<SituationFrequente[]> {
  const situations = await getSituationsEnLigne(langue);
  return situations.map((s) => ({
    id: String(s.id),
    libelle: s.libelle,
    pictogramme: s.pictogramme ?? undefined,
    fichierAudio: s.fichier_audio ?? undefined,
  }));
}

export interface PoserAssistantInput {
  situationId?: string;
  texte?: string;
  langue?: string;
}

export async function poserAssistant(
  input: PoserAssistantInput
): Promise<AssistantReponse> {
  const r = await poserAssistantEnLigne({
    texte: input.texte,
    situationId: input.situationId ? Number(input.situationId) : undefined,
    langue: input.langue,
  });
  if (r.trouve) {
    return {
      trouve: true,
      reponse: r.reponse,
      reference: r.reference,
      texte: r.texte ?? undefined,
      pictogrammes: r.pictogrammes ?? undefined,
      fichierAudio: r.fichier_audio ?? undefined,
    };
  }
  return {
    trouve: false,
    contactsFacilitateurs: r.contacts.map((c) => ({
      nom: c.nom,
      telephone: c.telephone,
      arrondissementNom: c.arrondissement,
    })),
  };
}

export async function getArrondissements(): Promise<Arrondissement[]> {
  const libelles = await getArrondissementsEnLigne();
  // Le serveur ne renvoie que des libellés, aucun identifiant : le libellé
  // sert lui-même d'id local, et c'est aussi ce que `/annuaire` attend.
  return libelles.map((nom) => ({ id: nom, departementId: "", nom }));
}

export interface AnnuaireResultat {
  contacts: FacilitateurAnnuaireEntry[];
  /** Vrai si le serveur a dû élargir au département faute de facilitateur actif localement. */
  repliDepartement: boolean;
  message: string | null;
}

export async function getAnnuaire(arrondissement: string): Promise<AnnuaireResultat> {
  const { contacts, repliDepartement, message } = await getAnnuaireEnLigne(
    arrondissement
  );
  return {
    contacts: contacts.map((c) => ({
      id: `${c.nom}-${c.telephone}`,
      nom: c.nom,
      telephone: c.telephone,
      arrondissementId: c.arrondissement,
      arrondissementNom: c.arrondissement,
    })),
    repliDepartement,
    message,
  };
}
