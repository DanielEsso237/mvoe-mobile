/**
 * Un identifiant local lisible à partir d'un libellé serveur (ex. un nom
 * d'arrondissement ou de portée) quand seul le libellé est connu, jamais un
 * identifiant stable. Ce n'est qu'un repère local, jamais renvoyé au serveur.
 */
export function slugify(libelle: string): string {
  return libelle
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
