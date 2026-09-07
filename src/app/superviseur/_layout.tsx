import { useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";

// Voir facilitateur/_layout.tsx pour l'explication complète.
export default function SuperviseurLayout() {
  const { superviseur } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Protected guard={!superviseur}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!!superviseur}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
