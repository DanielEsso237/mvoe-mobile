import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { Drawer } from "expo-router/drawer";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function KitLayout() {
  const { facilitateur, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!facilitateur) {
    return <Redirect href="/facilitateur" />;
  }

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: Colors.white,
          width: 280,
        },
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: "#374151",
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: "600",
        },
      }}
    >
      <Drawer.Screen name="accueil" options={{ drawerLabel: "Mon kit", title: "Mon kit" }} />
      <Drawer.Screen name="seance" options={{ drawerLabel: "Séance", title: "Séance" }} />
      <Drawer.Screen name="pointage" options={{ drawerLabel: "Pointage", title: "Pointage" }} />
      <Drawer.Screen
        name="fidelite"
        options={{ drawerLabel: "Fiche de fidélité", title: "Fidélité" }}
      />
      <Drawer.Screen
        name="inscrire"
        options={{ drawerLabel: "Inscrire un parent", title: "Inscrire un parent" }}
      />
      <Drawer.Screen name="activite" options={{ drawerLabel: "Activités", title: "Activités" }} />
      <Drawer.Screen name="visite" options={{ drawerLabel: "Visites", title: "Visites" }} />
      <Drawer.Screen name="signaler" options={{ drawerLabel: "Signaler", title: "Signaler" }} />
      <Drawer.Screen
        name="formation"
        options={{ drawerLabel: "Ma formation", title: "Ma formation" }}
      />
      <Drawer.Screen
        name="tableau-de-bord"
        options={{ drawerLabel: "Mon activité", title: "Mon activité" }}
      />
    </Drawer>
  );
}
