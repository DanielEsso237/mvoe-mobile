import type { Ionicons } from "@expo/vector-icons";

export type MenuKey =
  | "dashboard"
  | "registre"
  | "enregistrer-facilitateur"
  | "signalements"
  | "campagnes"
  | "rapport"
  | "parametres";

export interface MenuItemConfig {
  key: MenuKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

export const SUPERVISEUR_MENU: MenuItemConfig[] = [
  {
    key: "dashboard",
    label: "Tableau de bord",
    icon: "bar-chart-outline",
    route: "/superviseur/dashboard",
  },
  {
    key: "registre",
    label: "Registre",
    icon: "list-outline",
    route: "/superviseur/registre",
  },
  {
    key: "enregistrer-facilitateur",
    label: "Enregistrer un facilitateur",
    icon: "person-add-outline",
    route: "/superviseur/enregistrer-facilitateur",
  },
  {
    key: "signalements",
    label: "Signalements",
    icon: "warning-outline",
    route: "/superviseur/signalements",
  },
  {
    key: "campagnes",
    label: "Campagnes",
    icon: "megaphone-outline",
    route: "/superviseur/campagnes",
  },
  {
    key: "rapport",
    label: "Rapport",
    icon: "document-text-outline",
    route: "/superviseur/rapport",
  },
  {
    key: "parametres",
    label: "Paramètres",
    icon: "options-outline",
    route: "/superviseur/parametres",
  },
];
