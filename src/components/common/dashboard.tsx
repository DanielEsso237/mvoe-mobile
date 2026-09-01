import DashboardShell from "@/components/common/DashboardShell";
import StatCard from "@/components/common/StatCard";
import { ScrollView, StyleSheet } from "react-native";

export default function SuperviseurDashboard() {
  return (
    <DashboardShell activeKey="dashboard">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StatCard label="Signalements du mois" value={3} progress={0.3} />
        <StatCard label="Facilitateurs en attente de validation" value={4} />
        <StatCard label="Bénéficiaires enregistrés" value={78} />
      </ScrollView>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 24,
  },
});