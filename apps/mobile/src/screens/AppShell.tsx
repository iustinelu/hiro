import React from "react";
import { Text, View } from "react-native";
import { mobileTabs } from "../navigation/tabs";

export function AppShellScreen() {
  return (
    <View>
      <Text>Hiro Mobile Shell</Text>
      {mobileTabs.map((tab) => (
        <Text key={tab}>{tab}</Text>
      ))}
    </View>
  );
}
