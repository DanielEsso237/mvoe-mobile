import ComingSoon from "@/components/common/ComingSoon";
import DashboardShell from "@/components/common/DashboardShell";

export default function CampagnesScreen() {
  return (
    <DashboardShell activeKey="campagnes">
      <ComingSoon label="Campagnes" />
    </DashboardShell>
  );
}