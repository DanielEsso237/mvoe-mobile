import type {
  AssistantReponse,
  Feuilleton,
  ModuleCatalogue,
  ParentProgramme,
  QuestionSemaine,
  SituationFrequente,
  UniteDetail,
  UniteResume,
} from "@/types";

export const MOCK_PARENT_PROGRAMME: ParentProgramme = {
  id: "parent-1",
  codeParent: "EB2-01",
  langue: "fr",
  arrondissementId: "ebolowa-2",
};

export const MOCK_MODULES_CATALOGUE: ModuleCatalogue[] = [
  { numero: 1, titre: "Accueillir son enfant", unitesCount: 3, renseigne: true },
  { numero: 2, titre: "Discipline positive", unitesCount: 4, renseigne: true },
  { numero: 3, titre: "Communication bienveillante", unitesCount: 2, renseigne: true },
  { numero: 4, titre: "Prévenir les violences", unitesCount: 0, renseigne: false },
];

export const MOCK_UNITES_PAR_MODULE: Record<number, UniteResume[]> = {
  1: [
    {
      id: "u-1-1",
      moduleNumero: 1,
      titre: "Regarder son enfant dans les yeux",
      langueServie: "fr",
      languesDisponibles: ["fr", "bulu"],
    },
    {
      id: "u-1-2",
      moduleNumero: 1,
      titre: "Le premier sourire du matin",
      langueServie: "fr",
      languesDisponibles: ["fr"],
    },
  ],
  2: [
    {
      id: "u-2-1",
      moduleNumero: 2,
      titre: "Pourquoi la punition corporelle ne marche pas",
      langueServie: "fr",
      languesDisponibles: ["fr", "bulu"],
    },
    {
      id: "u-2-2",
      moduleNumero: 2,
      titre: "Trois alternatives concrètes",
      langueServie: "fr",
      languesDisponibles: ["fr"],
    },
  ],
};

export const MOCK_UNITE_DETAIL: Record<string, UniteDetail> = {
  "u-2-1": {
    id: "u-2-1",
    moduleNumero: 2,
    titre: "Pourquoi la punition corporelle ne marche pas",
    contenuTexte:
      "Frapper enseigne la peur de l'adulte, pas la raison de la règle.",
    fichierAudio: "m2-u1-fr.mp3",
    pictogrammes: ["colere.png", "enfant-triste.png"],
    langueServie: "fr",
    langueDeRepli: false,
    modalitesDisponibles: ["audio", "texte"],
  },
};

export const MOCK_FEUILLETON: Feuilleton = {
  titre: "Chez les Mbarga",
  resume: "Une famille comme la vôtre traverse les mêmes questions, épisode après épisode.",
  langue: "fr",
  langueDeRepli: false,
  episodes: [
    { numero: 1, titre: "Le carnet de notes", dureeSecondes: 320, dureeLisible: "5:20", fichierAudio: "feuilleton-ep1-fr.mp3" },
    { numero: 2, titre: "La dispute du soir", dureeSecondes: 290, dureeLisible: "4:50", fichierAudio: "feuilleton-ep2-fr.mp3" },
    { numero: 3, titre: "Le marché du samedi", dureeSecondes: 310, dureeLisible: "5:10", fichierAudio: "feuilleton-ep3-fr.mp3" },
    { numero: 4, titre: "Ce qui a changé", dureeSecondes: 275, dureeLisible: "4:35", fichierAudio: "feuilleton-ep4-fr.mp3" },
  ],
};

export const MOCK_QUESTIONS_SEMAINE: QuestionSemaine[] = [
  {
    id: "q-1",
    enonce: "Que faire quand votre enfant refuse de vous écouter ?",
    options: [
      { id: "q1-a", libelle: "Crier plus fort" },
      { id: "q1-b", libelle: "Se mettre à sa hauteur et reformuler calmement" },
      { id: "q1-c", libelle: "Ignorer la situation" },
    ],
    explication:
      "Se mettre à hauteur d'enfant et reformuler calmement aide l'enfant à comprendre la règle sans avoir peur.",
    reference: "Module 2 — Discipline positive",
  },
  {
    id: "q-2",
    enonce: "Un enfant qui pleure beaucoup a-t-il forcément un problème grave ?",
    options: [
      { id: "q2-a", libelle: "Oui, toujours" },
      { id: "q2-b", libelle: "Non, cela peut être une émotion normale à accompagner" },
    ],
    explication:
      "Pleurer est une émotion normale ; l'accompagner sans dramatiser aide l'enfant à se calmer.",
    reference: "Module 3 — Communication bienveillante",
  },
];

export const MOCK_SITUATIONS_FREQUENTES: SituationFrequente[] = [
  { id: "sit-1", libelle: "Mon enfant fait une crise en public" },
  { id: "sit-2", libelle: "Mon enfant ne veut pas faire ses devoirs" },
  { id: "sit-3", libelle: "Mon enfant a été puni à l'école" },
];

export const MOCK_ASSISTANT_REPONSES: Record<string, AssistantReponse> = {
  "sit-1": {
    trouve: true,
    reponse:
      "Restez calme, éloignez-vous du regard des autres si possible, et attendez que l'émotion redescende avant de parler.",
    reference: "Module 2 — Discipline positive",
    texte:
      "Une crise en public n'est pas un caprice : c'est une émotion trop grande pour l'enfant à ce moment-là.",
  },
};

export const MOCK_ASSISTANT_REPONSE_INTROUVABLE: AssistantReponse = {
  trouve: false,
  contactsFacilitateurs: [
    { nom: "Ateba Marie-Claire", telephone: "699 11 22 33", arrondissementNom: "Ebolowa II" },
    { nom: "Ndzana Léonie", telephone: "677 44 55 66", arrondissementNom: "Ebolowa II" },
  ],
};
