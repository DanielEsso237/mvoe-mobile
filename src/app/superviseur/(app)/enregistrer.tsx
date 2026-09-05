import AccountMenu from "@/components/common/AccountMenu";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/client";
import { enregistrerFacilitateur, getTypesJuridiques } from "@/services/superviseur";
import type { IdentifiantsFacilitateur, TypeJuridique } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function formatDate(date: Date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function EnregistrerScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const { superviseur } = useAuth();
  const compte = superviseur?.compte;

  const [typeOptions, setTypeOptions] = useState<
    { value: TypeJuridique; label: string }[]
  >([]);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [typeJuridique, setTypeJuridique] = useState<TypeJuridique | null>(null);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [dateFormation] = useState(() => formatDate(new Date()));
  const [organisation, setOrganisation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [identifiants, setIdentifiants] = useState<IdentifiantsFacilitateur | null>(
    null
  );

  useEffect(() => {
    getTypesJuridiques().then(setTypeOptions);
  }, []);

  const isValid =
    nom.trim().length > 0 && telephone.trim().length > 0 && !!typeJuridique;

  const handleSubmit = async () => {
    if (!isValid || !compte || !typeJuridique) return;
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const result = await enregistrerFacilitateur({
        nom,
        telephone,
        email: email.trim() || undefined,
        typeJuridique,
        dateFormationInitiale: dateFormation,
        organisationRattachement: organisation.trim() || undefined,
        arrondissementId: compte.portee.entiteId ?? "",
        arrondissementNom: compte.portee.libelle,
        departementNom: compte.portee.libelle,
      });
      setIdentifiants(result.identifiants);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "L'enregistrement a échoué."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const typeJuridiqueLabel = typeOptions.find(
    (t) => t.value === typeJuridique
  )?.label;

  const isArrondissement = compte?.portee.niveau === "arrondissement";

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
          <AccountMenu />
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

        {!isArrondissement ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Réservé à la délégation d&apos;arrondissement</Text>
            <Text style={styles.cardSubtitle}>
              Un facilitateur est enregistré par la délégation d&apos;arrondissement
              où il anime, jamais depuis un compte régional ou national.
            </Text>
          </View>
        ) : identifiants ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Identifiants à remettre</Text>
            <Text style={styles.cardSubtitle}>
              Ils ne s&apos;afficheront plus jamais. Notez-les ou remettez cet
              écran en main propre avant de continuer.
            </Text>

            <View style={styles.identifiantsBox}>
              <View style={styles.identifiantRow}>
                <Text style={styles.identifiantLabel}>Téléphone</Text>
                <Text style={styles.identifiantValue}>
                  {identifiants.telephone}
                </Text>
              </View>
              <View style={styles.identifiantRow}>
                <Text style={styles.identifiantLabel}>Code d&apos;appareil</Text>
                <Text style={styles.identifiantValueMono}>
                  {identifiants.codeAppareil}
                </Text>
              </View>
              {identifiants.email && (
                <View style={styles.identifiantRow}>
                  <Text style={styles.identifiantLabel}>E-mail</Text>
                  <Text style={styles.identifiantValue}>
                    {identifiants.email}
                  </Text>
                </View>
              )}
              <View style={styles.identifiantRow}>
                <Text style={styles.identifiantLabel}>Mot de passe</Text>
                <Text style={styles.identifiantValueMono}>
                  {identifiants.motDePasse}
                </Text>
              </View>
            </View>

            <View style={styles.warningBanner}>
              <Ionicons name="warning-outline" size={18} color="#92400E" />
              <Text style={styles.warningText}>
                Une seule fois. Le système n&apos;envoie aucun message : c&apos;est
                à vous de les remettre.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => router.push("/superviseur/registre")}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>Terminé</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Form card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Le dossier</Text>
              <Text style={styles.cardSubtitle}>
                Il sera rattaché à votre arrondissement. Ni l&apos;arrondissement ni
                le mot de passe ne se saisissent ici : le premier est le vôtre, le
                second est généré par le serveur.
              </Text>

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
                    {typeJuridiqueLabel ?? "Choisir..."}
                  </Text>
                  <Ionicons
                    name={typeDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
                {typeDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    {typeOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.dropdownItem,
                          typeJuridique === option.value &&
                            styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setTypeJuridique(option.value);
                          setTypeDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            typeJuridique === option.value &&
                              styles.dropdownItemTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {typeJuridique === option.value && (
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

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Date de formation initiale</Text>
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>{dateFormation}</Text>
                </View>
              </View>

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

              {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!isValid || submitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={!isValid || submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? "Enregistrement…" : "Enregistrer le facilitateur"}
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
                    <Text style={styles.stepBold}>{compte?.portee.libelle}</Text>,
                    et nulle part ailleurs.
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
                    <Text style={styles.stepBold}>une seule fois</Text>. Prévoyez
                    de quoi les noter, ou imprimez la fiche.
                  </Text>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Vous les remettez en main propre. Le système n&apos;envoie
                    aucun message.
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
          </>
        )}

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
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 12,
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
  identifiantsBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  identifiantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  identifiantLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  identifiantValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  identifiantValueMono: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  warningBanner: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 19,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});
