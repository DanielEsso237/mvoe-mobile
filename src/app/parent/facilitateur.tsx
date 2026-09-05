import ParentHeader from "@/components/parent/ParentHeader";
import { Colors } from "@/constants/colors";
import { getAnnuaire, getArrondissements } from "@/services/parent";
import type { Arrondissement, FacilitateurAnnuaireEntry } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FacilitateurAnnuaireScreen() {
  const [arrondissements, setArrondissements] = useState<Arrondissement[]>([]);
  const [arrondissementId, setArrondissementId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<FacilitateurAnnuaireEntry[] | null>(
    null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    getArrondissements().then(setArrondissements);
    getAnnuaire().then(setContacts);
  }, []);

  const choisirArrondissement = async (id: string | null) => {
    setArrondissementId(id);
    setDropdownOpen(false);
    setContacts(await getAnnuaire(id ?? undefined));
  };

  const appeler = (telephone: string) => {
    Linking.openURL(`tel:${telephone.replace(/\s+/g, "")}`);
  };

  const selectedLabel =
    arrondissements.find((a) => a.id === arrondissementId)?.nom ??
    "Tous les arrondissements";

  return (
    <View style={styles.root}>
      <ParentHeader title="Trouver un facilitateur" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Rien de ce que vous choisissez ici n&apos;est enregistré.
        </Text>

        <View style={styles.filterField}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownOpen((v) => !v)}
          >
            <Text style={styles.dropdownText}>{selectedLabel}</Text>
            <Ionicons
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => choisirArrondissement(null)}
              >
                <Text style={styles.dropdownItemText}>Tous les arrondissements</Text>
              </TouchableOpacity>
              {arrondissements.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={styles.dropdownItem}
                  onPress={() => choisirArrondissement(a.id)}
                >
                  <Text style={styles.dropdownItemText}>{a.nom}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {contacts && contacts.length === 0 && (
          <Text style={styles.emptyText}>
            Aucun facilitateur actif ici pour l&apos;instant.
          </Text>
        )}

        {contacts?.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nom}>{c.nom}</Text>
              <Text style={styles.arrondissement}>{c.arrondissementNom}</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => appeler(c.telephone)}
            >
              <Ionicons name="call" size={16} color={Colors.white} />
              <Text style={styles.callButtonText}>{c.telephone}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.footer}>
          © 2026 Mvoé — Programme national de parentalité positive, MINPROFF.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F6" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 10 },
  intro: { fontSize: 13, color: Colors.textMuted, lineHeight: 19 },
  filterField: { position: "relative", zIndex: 10 },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: { fontSize: 15, color: Colors.text, fontWeight: "600" },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 20,
    elevation: 6,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: { fontSize: 14, color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: "center", marginTop: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    gap: 12,
  },
  nom: { fontSize: 15, fontWeight: "700", color: Colors.text },
  arrondissement: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  callButtonText: { color: Colors.white, fontSize: 13, fontWeight: "700" },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});
