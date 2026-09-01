import { Colors } from "@/constants/colors";
import { Drawer } from "expo-router/drawer";

export default function SuperviseurLayout() {
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
      <Drawer.Screen
        name="dashboard"
        options={{ drawerLabel: "Tableau de bord", title: "Tableau de bord" }}
      />
      <Drawer.Screen
        name="registre"
        options={{ drawerLabel: "Registre", title: "Registre" }}
      />
      <Drawer.Screen
        name="enregistrer"
        options={{
          drawerLabel: "Enregistrer un facilitateur",
          title: "Enregistrer",
        }}
      />
      <Drawer.Screen
        name="signalements"
        options={{ drawerLabel: "Signalements", title: "Signalements" }}
      />
      <Drawer.Screen
        name="campagnes"
        options={{ drawerLabel: "Campagnes", title: "Campagnes" }}
      />
      <Drawer.Screen
        name="rapport"
        options={{ drawerLabel: "Rapport", title: "Rapport" }}
      />
      <Drawer.Screen
        name="parametres"
        options={{ drawerLabel: "Paramètres", title: "Paramètres" }}
      />
    </Drawer>
  );
}
