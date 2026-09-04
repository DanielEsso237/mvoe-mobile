import AccountMenu from "@/components/common/AccountMenu";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const REGION_NAME = "Ebolowa II";

// TODO: remplacer par la vraie liste métier si elle existe déjà côté serveur.
const TYPE_JURIDIQUE_OPTIONS = [
  "Agent public",
  "Enseignant",
  "ONG",
  "Association de femmes",
  "Groupe religieux",
  "Relais communautaire",
  "Vacataire",
];

function formatDate(date: Date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function EnregistrerScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [typeJuridique, setTypeJuridique] = useState<string | null>(null);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [dateFormation] = useState(() => formatDate(new Date()));
  const [organisation, setOrganisation] = useState("");

  const isValid =
    nom.trim().length > 0 && telephone.trim().length > 0 && !!typeJuridique;

  const handleSubmit = () => {
    if (!isValid) return;

    Alert.alert(
      "Facilitateur enregistré",
      "Le code d'appareil et le mot de passe s'affichent une seule fois. Notez-les avant de continuer.",
      [
        {
          text: "OK",
          onPress: () => router.push("/superviseur/registre"),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuBtn}
          hitSlop={10}
        >
          <Ionicons name="menu" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mvoé</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity hitSlop={10} style={styles.iconBtn}>
            <Ionicons
              name="sunny-outline"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>
          <AccountMenu delegationLabel={REGION_NAME} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Text
            style={styles.breadcrumbLink}
            onPress={() => router.push("/superviseur/registre")}
          >
            Registre
          </Text>
          <Text style={styles.breadcrumbSep}> / </Text>
          <Text style={styles.breadcrumbCurrent}>
            Enregistrer un facilitateur
          </Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Le dossier</Text>
          <Text style={styles.cardSubtitle}>
            Il sera rattaché à votre arrondissement. Ni l&apos;arrondissement ni
            le mot de passe ne se saisissent ici : le premier est le vôtre, le
            second est généré par le serveur.
          </Text>

          {/* Nom et prénom */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nom et prénom</Text>
            <TextInput
              style={styles.input}
              placeholder="Ateba Marie-Claire"
              placeholderTextColor={Colors.placeholder}
              value={nom}
              onChangeText={setNom}
            />
          </View>

          {/* Téléphone */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="699 00 00 00"
              placeholderTextColor={Colors.placeholder}
              keyboardType="phone-pad"
              value={telephone}
              onChangeText={setTelephone}
            />
          </View>

          {/* Adresse e-mail */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              Adresse e-mail{" "}
              <Text style={styles.optionalTag}>— facultative</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholderTextColor={Colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Text style={styles.helperText}>
              Laissez vide : elle sera dérivée de son nom.
            </Text>
          </View>

          {/* Type juridique */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Type juridique</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setTypeDropdownOpen(!typeDropdownOpen)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !typeJuridique && styles.dropdownPlaceholder,
                ]}
              >
                {typeJuridique ?? "Choisir..."}
              </Text>
              <Ionicons
                name={typeDropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            {typeDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {TYPE_JURIDIQUE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownItem,
                      typeJuridique === option && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setTypeJuridique(option);
                      setTypeDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        typeJuridique === option &&
                          styles.dropdownItemTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                    {typeJuridique === option && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Date de formation initiale */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Date de formation initiale</Text>
            <View style={styles.dateBox}>
              <Text style={styles.dateText}>{dateFormation}</Text>
            </View>
          </View>

          {/* Organisation de rattachement */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              Organisation de rattachement{" "}
              <Text style={styles.optionalTag}>— facultative</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Association des femmes d'Ebolowa"
              placeholderTextColor={Colors.placeholder}
              value={organisation}
              onChangeText={setOrganisation}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !isValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={!isValid}
          >
            <Text style={styles.submitButtonText}>
              Enregistrer le facilitateur
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ce qui va se passer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ce qui va se passer</Text>

          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Le dossier est créé dans{" "}
                <Text style={styles.stepBold}>{REGION_NAME}</Text>, et nulle
                part ailleurs.
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Le serveur génère un code d&apos;appareil et un mot de passe.
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Ils s&apos;affichent{" "}
                <Text style={styles.stepBold}>une seule fois</Text>. Prévoyez de
                quoi les noter, ou imprimez la fiche.
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Vous les remettez en main propre. Le système n&apos;envoie aucun
                message.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.noteText}>
            Le type juridique n&apos;est pas décoratif : c&apos;est lui qui
            permettra de savoir quel type de facilitateur reste actif le plus
            longtemps.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          © 2026 Mvoé — Programme national de parentalité positive, MINPROFF.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    gap: 12,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  breadcrumbLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  breadcrumbSep: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  breadcrumbCurrent: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  optionalTag: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  dropdownText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    color: Colors.placeholder,
    fontWeight: "400",
  },
  dropdownMenu: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemActive: {
    backgroundColor: "#F0F4FF",
  },
  dropdownItemText: {
    fontSize: 15,
    color: Colors.text,
  },
  dropdownItemTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  dateBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  dateText: {
    fontSize: 15,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#A5AEFC",
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  stepsList: {
    gap: 18,
    marginBottom: 20,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  stepBold: {
    fontWeight: "700",
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  noteText: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});
