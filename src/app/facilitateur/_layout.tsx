import { useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";

/**
 * Le passage de l'écran de connexion (un Stack simple) vers « (kit) » (un
 * Drawer) via `router.replace()` fait planter Fabric en production
 * ("child already has a parent") : désactiver l'animation n'y change rien
 * (bug confirmé par capture logcat sur l'APK réel, pas une hypothèse). La
 * vraie solution, documentée par Expo lui-même pour ce cas précis, est de
 * ne plus naviguer à la main : `Stack.Protected` bascule seul entre les
 * deux groupes d'écrans selon l'état de connexion, sans jamais imposer un
 * remplacement impératif entre deux navigateurs distincts.
 */
export default function FacilitateurLayout() {
  const { facilitateur } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Protected guard={!facilitateur}>
        <Stack.Screen name="index" />
        <Stack.Screen name="email" />
      </Stack.Protected>
      <Stack.Protected guard={!!facilitateur}>
        <Stack.Screen name="(kit)" />
      </Stack.Protected>
    </Stack>
  );
}
