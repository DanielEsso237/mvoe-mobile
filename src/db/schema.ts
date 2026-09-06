/**
 * Schéma de la base locale (SQLite) : c'est elle qui tient lieu de "backend"
 * tant que l'appareil est hors-ligne. Chaque étape ajoute ses propres
 * tables ; celle-ci pose les tables communes à l'authentification des
 * trois espaces, plus la file de synchronisation générique que les étapes
 * suivantes rempliront avec les écritures métier (facilitateur, superviseur,
 * parent) à renvoyer vers l'API Laravel de référence dès que le réseau
 * revient.
 */
export const SCHEMA_VERSION = 1;

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
];
