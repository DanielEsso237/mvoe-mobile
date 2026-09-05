import type {
  ActiviteTerrain,
  CohortePaquet,
  CohorteResume,
  FacilitateurCompte,
  Foyer,
  GroupeSoutien,
  ModuleFormation,
  ParentInscrit,
  Seance,
  SignalementFacilitateur,
  TableauDeBordFacilitateur,
} from "@/types";

export const MOCK_FACILITATEUR_COMPTE: FacilitateurCompte = {
  id: "fac-1",
  nom: "Ateba Marie-Claire",
  telephone: "699 11 22 33",
  arrondissementNom: "Ebolowa II",
};

export const MOCK_COHORTES_DISPONIBLES: CohorteResume[] = [
  {
    id: "coh-1",
    libelle: "Cohorte A — Ngoazip",
    parents: 22,
    ratioMax: 25,
    dateDebut: "2026-03-01",
  },
];

const MOCK_PARENTS_INSCRITS: ParentInscrit[] = [
  { id: "p-1", codeParent: "EB2-01", repereLocal: undefined, presence: "a_pointer" },
  { id: "p-2", codeParent: "EB2-02", presence: "a_pointer" },
  { id: "p-3", codeParent: "EB2-03", presence: "a_pointer" },
  { id: "p-4", codeParent: "EB2-04", presence: "a_pointer" },
  { id: "p-5", codeParent: "EB2-05", presence: "a_pointer" },
];

const MOCK_SEANCES: Seance[] = [
  {
    id: "seance-1",
    moduleCode: "M2",
    moduleTitre: "Discipline positive",
    statut: "en_cours",
    demarreeLe: "2026-09-05T08:00:00",
    sequences: [
      {
        id: "seq-1",
        ordre: 1,
        titre: "Brise-glace",
        type: "brise_glace",
        dureeMinutes: 5,
      },
      {
        id: "seq-2",
        ordre: 2,
        titre: "Pourquoi la punition corporelle ne marche pas",
        type: "unite",
        dureeMinutes: 15,
        unite: {
          code: "M2-U1",
          messageCle: "punition_corporelle_effets",
          languesDisponibles: ["fr", "bulu"],
          audioParLangue: {
            fr: "m2-u1-fr.mp3",
            bulu: "m2-u1-bulu.mp3",
          },
          texteParLangue: {
            fr: "La punition corporelle enseigne la peur, pas la règle.",
          },
          pictogrammes: ["colere.png", "enfant-triste.png"],
        },
      },
      {
        id: "seq-3",
        ordre: 3,
        titre: "Trois alternatives concrètes",
        type: "unite",
        dureeMinutes: 20,
        unite: {
          code: "M2-U2",
          messageCle: "alternatives_discipline",
          languesDisponibles: ["fr"],
          audioParLangue: { fr: "m2-u2-fr.mp3" },
          texteParLangue: {
            fr: "Retrait calme, conséquence logique, dialogue après coup.",
          },
        },
      },
      {
        id: "seq-4",
        ordre: 4,
        titre: "Échanges en groupe",
        type: "echange",
        dureeMinutes: 10,
      },
      {
        id: "seq-5",
        ordre: 5,
        titre: "Clôture",
        type: "cloture",
        dureeMinutes: 5,
      },
    ],
  },
  {
    id: "seance-2",
    moduleCode: "M3",
    moduleTitre: "Communication bienveillante",
    statut: "a_venir",
    sequences: [],
  },
];

export const MOCK_PAQUET: CohortePaquet = {
  cohorte: MOCK_COHORTES_DISPONIBLES[0],
  seances: MOCK_SEANCES,
  parents: MOCK_PARENTS_INSCRITS,
  telechargeLe: "2026-09-01T07:30:00",
};

export const MOCK_ACTIVITES_TERRAIN: ActiviteTerrain[] = [
  {
    id: "act-1",
    type: "causerie",
    date: "2026-08-28",
    dureeMinutes: 45,
    lieu: "Sous le grand manguier, marché central",
    personnesTouchees: 18,
    dontHandicap: 1,
    hommes: 6,
    femmes: 12,
  },
];

export const MOCK_FOYERS: Foyer[] = [
  {
    id: "foyer-1",
    localite: "Quartier Nko'ovos",
    adultes: 2,
    enfants: 3,
    difficultesFonctionnelles: [],
    dejaParticipeProgramme: true,
  },
];

export const MOCK_GROUPES_SOUTIEN: GroupeSoutien[] = [
  {
    id: "gsp-1",
    nom: "Groupe de soutien Ngoazip",
    actif: true,
    derniereReunion: "2026-08-20",
  },
];

export const MOCK_SIGNALEMENTS_FACILITATEUR: SignalementFacilitateur[] = [
  {
    id: "sig-1",
    type: "negligence",
    gravite: "grave",
    soumisLe: "2026-08-25",
    statut: "soumis",
    joursAttente: 11,
  },
];

export const MOCK_MODULES_FORMATION: ModuleFormation[] = [
  {
    code: "F1",
    titre: "Poser une séance sans juger",
    type: "obligatoire",
    objectif: "Reconnaître un déroulé fidèle sans le confondre avec un contrôle.",
    dureeMinutes: 40,
    progression: 1,
    termine: true,
    sections: [
      {
        id: "f1-s1",
        titre: "Ce qu'une séance fidèle veut dire",
        dureeMinutes: 10,
        corps: "Une séance fidèle suit le déroulé, pas le silence du groupe.",
        lue: true,
      },
      {
        id: "f1-s2",
        titre: "Le brise-glace n'est pas un remplissage",
        dureeMinutes: 10,
        corps: "Le temps libre du brise-glace fait partie du déroulé, pas un à-côté.",
        lue: true,
      },
    ],
  },
  {
    code: "F2",
    titre: "Repérer un signalement",
    type: "obligatoire",
    objectif: "Distinguer une observation à signaler d'un jugement personnel.",
    dureeMinutes: 30,
    progression: 0.5,
    termine: false,
    sections: [
      {
        id: "f2-s1",
        titre: "Observer sans nommer",
        dureeMinutes: 15,
        corps: "Décrire un fait observable, jamais une intention supposée.",
        lue: true,
      },
      {
        id: "f2-s2",
        titre: "Ce qui arrive après un signalement",
        dureeMinutes: 15,
        corps: "Aucune autorité n'est prévenue automatiquement : un humain juge.",
        lue: false,
      },
    ],
  },
];

export const MOCK_TABLEAU_DE_BORD_FACILITATEUR: TableauDeBordFacilitateur = {
  cohortes: 1,
  parentsInscrits: 22,
  seancesTenues: 4,
  ecartsReleves: 1,
  doseMoyenne: 1.2,
  delaiMoyenRemontee: 2.5,
  activites: 3,
  personnesTouchees: 41,
  femmes: 27,
  hommes: 14,
  foyersSuivis: 6,
  foyersDifficulteFonctionnelle: 1,
  groupesSoutienActifs: 1,
  participantsHandicap: 1,
  signalementsAttente: 1,
};
