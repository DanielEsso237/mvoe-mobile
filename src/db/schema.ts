/**
 * Schéma de la base locale (SQLite) : c'est elle qui tient lieu de "backend"
 * tant que l'appareil est hors-ligne. Chaque étape ajoute ses propres
 * tables ; celle-ci pose les tables communes à l'authentification des
 * trois espaces, plus la file de synchronisation générique que les étapes
 * suivantes rempliront avec les écritures métier (facilitateur, superviseur,
 * parent) à renvoyer vers l'API Laravel de référence dès que le réseau
 * revient.
 */
export const SCHEMA_VERSION = 4;

export const MIGRATIONS: string[] = [
  // v1 — comptes et sessions des trois espaces + file de synchronisation.
  `
  CREATE TABLE IF NOT EXISTS superviseurs (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mot_de_passe_hash TEXT NOT NULL,
    niveau TEXT NOT NULL,
    entite_id TEXT,
    entite_libelle TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS facilitateurs (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    telephone TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    code_appareil_hash TEXT,
    mot_de_passe_hash TEXT,
    type_juridique TEXT NOT NULL,
    organisation_rattachement TEXT,
    arrondissement_id TEXT NOT NULL,
    arrondissement_nom TEXT NOT NULL,
    departement_nom TEXT NOT NULL,
    date_formation_initiale TEXT NOT NULL,
    derniere_activite TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS parents_programme (
    id TEXT PRIMARY KEY,
    code_parent TEXT NOT NULL UNIQUE,
    code_acces_hash TEXT NOT NULL,
    langue TEXT NOT NULL,
    arrondissement_id TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('facilitateur','superviseur','parent')),
    account_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    method TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    payload TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'en_attente',
    tentatives INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_error TEXT
  );
  `,
  // v2 — le domaine du kit facilitateur : le "paquet" de cohorte, le
  // curriculum (modules/séquences), et tout ce que le terrain remonte comme
  // événements (activités, foyers, visites, groupes, signalements,
  // formation). Les identifiants des lignes créées par un événement SONT
  // l'UUID de cet événement : c'est ce que le serveur de référence attend
  // pour les retrouver (ex. `Foyer::where('uuid', $charge['foyer_uuid'])`).
  `
  CREATE TABLE IF NOT EXISTS cohortes (
    id TEXT PRIMARY KEY,
    facilitateur_id TEXT NOT NULL,
    libelle TEXT NOT NULL,
    arrondissement_id TEXT NOT NULL,
    ratio_max INTEGER NOT NULL,
    date_debut TEXT NOT NULL,
    telecharge_le TEXT
  );

  CREATE TABLE IF NOT EXISTS modules_curriculum (
    code TEXT PRIMARY KEY,
    titre TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sequences_curriculum (
    id TEXT PRIMARY KEY,
    module_code TEXT NOT NULL,
    ordre INTEGER NOT NULL,
    titre TEXT NOT NULL,
    type TEXT NOT NULL,
    duree_minutes INTEGER NOT NULL,
    unite_code TEXT,
    unite_message_cle TEXT,
    unite_langues_disponibles TEXT,
    unite_audio_par_langue TEXT,
    unite_texte_par_langue TEXT,
    unite_pictogrammes TEXT
  );

  CREATE TABLE IF NOT EXISTS seances (
    id TEXT PRIMARY KEY,
    cohorte_id TEXT NOT NULL,
    module_code TEXT NOT NULL,
    module_titre TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'en_cours',
    demarree_le TEXT NOT NULL,
    terminee_le TEXT
  );

  CREATE TABLE IF NOT EXISTS sequences_ouvertes (
    id TEXT PRIMARY KEY,
    seance_id TEXT NOT NULL,
    sequence_id TEXT NOT NULL,
    ouverte_a TEXT NOT NULL,
    duree_reelle_secondes INTEGER
  );

  CREATE TABLE IF NOT EXISTS fiches_fidelite (
    id TEXT PRIMARY KEY,
    seance_id TEXT NOT NULL,
    sequence_id TEXT,
    realisee_bool INTEGER,
    note_qualite TEXT,
    commentaire TEXT
  );

  CREATE TABLE IF NOT EXISTS parents_inscrits (
    id TEXT PRIMARY KEY,
    cohorte_id TEXT NOT NULL,
    code_parent TEXT NOT NULL,
    repere_local TEXT
  );

  CREATE TABLE IF NOT EXISTS presences (
    id TEXT PRIMARY KEY,
    seance_id TEXT NOT NULL,
    parent_id TEXT NOT NULL,
    statut TEXT NOT NULL,
    UNIQUE(seance_id, parent_id)
  );

  CREATE TABLE IF NOT EXISTS activites (
    id TEXT PRIMARY KEY,
    facilitateur_id TEXT NOT NULL,
    cohorte_id TEXT,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    lieu TEXT NOT NULL,
    duree_minutes INTEGER NOT NULL,
    nb_parents_touches INTEGER NOT NULL,
    nb_hommes INTEGER NOT NULL DEFAULT 0,
    nb_femmes INTEGER NOT NULL DEFAULT 0,
    nb_participants_handicap INTEGER NOT NULL DEFAULT 0,
    commentaire TEXT,
    groupe_soutien_id TEXT
  );

  CREATE TABLE IF NOT EXISTS foyers (
    id TEXT PRIMARY KEY,
    facilitateur_id TEXT NOT NULL,
    localite TEXT NOT NULL,
    nb_adultes INTEGER NOT NULL,
    nb_enfants INTEGER NOT NULL,
    difficultes_fonctionnelles_foyer TEXT,
    deja_suivi_programme INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS visites (
    id TEXT PRIMARY KEY,
    foyer_id TEXT NOT NULL,
    facilitateur_id TEXT NOT NULL,
    date TEXT NOT NULL,
    observations_structurees TEXT,
    suivi_prevu INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS groupes_soutien (
    id TEXT PRIMARY KEY,
    facilitateur_id TEXT NOT NULL,
    cohorte_id TEXT,
    libelle TEXT NOT NULL,
    date_creation TEXT NOT NULL,
    derniere_reunion TEXT
  );

  CREATE TABLE IF NOT EXISTS signalements_facilitateur (
    id TEXT PRIMARY KEY,
    facilitateur_id TEXT NOT NULL,
    activite_id TEXT,
    type TEXT NOT NULL,
    gravite TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'soumis',
    soumis_le TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS modules_formation (
    code TEXT PRIMARY KEY,
    titre TEXT NOT NULL,
    type TEXT NOT NULL,
    objectif TEXT NOT NULL,
    duree_minutes INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sections_formation (
    id TEXT PRIMARY KEY,
    module_code TEXT NOT NULL,
    ordre INTEGER NOT NULL,
    titre TEXT NOT NULL,
    duree_minutes INTEGER NOT NULL,
    corps TEXT NOT NULL,
    fichier_audio TEXT
  );

  CREATE TABLE IF NOT EXISTS progression_formation (
    facilitateur_id TEXT NOT NULL,
    module_code TEXT NOT NULL,
    sections_vues TEXT NOT NULL DEFAULT '[]',
    derniere_ouverture TEXT,
    termine_a TEXT,
    PRIMARY KEY (facilitateur_id, module_code)
  );
  `,
  // v3 — connexion en ligne : un compte réel (identifiants du serveur de
  // référence) n'a ni téléphone ni type juridique connus au moment où il se
  // provisionne localement au premier login en ligne. `api_token` porte le
  // jeton Sanctum obtenu, réutilisé par le moteur de synchronisation.
  `
  CREATE TABLE facilitateurs_v3 (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    telephone TEXT UNIQUE,
    email TEXT UNIQUE,
    code_appareil_hash TEXT,
    mot_de_passe_hash TEXT,
    type_juridique TEXT,
    organisation_rattachement TEXT,
    arrondissement_id TEXT NOT NULL,
    arrondissement_nom TEXT NOT NULL,
    departement_nom TEXT,
    date_formation_initiale TEXT,
    derniere_activite TEXT,
    api_token TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  INSERT INTO facilitateurs_v3 (
    id, nom, telephone, email, code_appareil_hash, mot_de_passe_hash,
    type_juridique, organisation_rattachement, arrondissement_id,
    arrondissement_nom, departement_nom, date_formation_initiale,
    derniere_activite, created_at
  )
  SELECT
    id, nom, telephone, email, code_appareil_hash, mot_de_passe_hash,
    type_juridique, organisation_rattachement, arrondissement_id,
    arrondissement_nom, departement_nom, date_formation_initiale,
    derniere_activite, created_at
  FROM facilitateurs;

  DROP TABLE facilitateurs;
  ALTER TABLE facilitateurs_v3 RENAME TO facilitateurs;
  `,
  // v4 — téléchargement de la vraie cohorte depuis le serveur de référence.
  // `module_courant_code` porte le module que `CohorteController::index`
  // désigne comme "prochaine séance" au moment du téléchargement ; il ne se
  // met pas à jour tout seul ensuite (il faudrait retélécharger le paquet
  // pour connaître le module suivant), ce qui est acceptable pour l'usage
  // actuel du kit.
  `
  ALTER TABLE cohortes ADD COLUMN module_courant_code TEXT;
  `,
];
