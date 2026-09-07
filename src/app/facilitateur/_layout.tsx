import { Stack } from "expo-router";

export default function FacilitateurLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        // Le passage de l'écran de connexion (simple) vers « (kit) » (un
        // Drawer) laisse les deux arbres de vues natives montés en même
        // temps le temps de l'animation par défaut — Fabric peut alors
        // essayer d'attacher la même vue à deux parents et planter
        // ("child already has a parent") en production. Sans animation,
        // le changement est instantané, sans fenêtre de recouvrement.
        animation: "none",
      }}
    />
  );
}
