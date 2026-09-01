import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { MenuKey, SUPERVISEUR_MENU } from "@/constants/menu";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar";

interface Props {
  activeKey: MenuKey;
  children: React.ReactNode;
}

export default function DashboardShell({ activeKey, children }: Props) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const title =
    SUPERVISEUR_MENU.find((item) => item.key === activeKey)?.label ?? "";

  return (
    <View style={styles.container}>
      <DashboardHeader
        title={title}
        onMenuPress={() => setSidebarVisible(true)}
      />
      <View style={styles.content}>{children}</View>
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeKey={activeKey}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
