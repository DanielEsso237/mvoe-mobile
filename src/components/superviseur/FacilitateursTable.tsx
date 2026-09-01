import { Colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

interface Facilitateur {
  nom: string;
  derniereActivite: string;
}

interface Props {
  facilitateurs: Facilitateur[];
}

export default function FacilitateursTable({ facilitateurs }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Facilitateurs</Text>
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.headerCell}>Nom</Text>
          <Text style={[styles.headerCell, styles.rightCell]}>
            Dernière{"\n"}activité
          </Text>
        </View>
        {/* Rows */}
        {facilitateurs.map((f, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index < facilitateurs.length - 1 && styles.rowBorder,
            ]}
          >
            <Text style={styles.nameCell}>{f.nom}</Text>
            <Text style={[styles.dateCell, styles.rightCell]}>
              {f.derniereActivite}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableHeader: {
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  rightCell: {
    textAlign: "right",
    flex: 0,
    minWidth: 90,
  },
  nameCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  dateCell: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
