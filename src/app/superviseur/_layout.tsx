import { Stack } from "expo-router";

export default function SuperviseurLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        // Voir facilitateur/_layout.tsx pour l'explication.
        animation: "none",
      }}
    />
  );
}
