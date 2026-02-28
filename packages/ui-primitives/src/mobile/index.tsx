import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { tokens } from "@hiro/ui-tokens";

export function MobileButton(props: { label: string; disabled?: boolean }) {
  return (
    <TouchableOpacity
      disabled={props.disabled}
      style={{
        paddingVertical: tokens.spacing.sm,
        paddingHorizontal: tokens.spacing.lg,
        borderRadius: tokens.radius.md,
        backgroundColor: props.disabled ? tokens.color.border : tokens.color.accent,
        minHeight: 44,
        justifyContent: "center"
      }}
    >
      <Text style={{ color: "white" }}>{props.label}</Text>
    </TouchableOpacity>
  );
}

export function MobileLoadingState() {
  return <View><Text>Loading...</Text></View>;
}

export function MobileEmptyState() {
  return <View><Text>Nothing here yet.</Text></View>;
}

export function MobileErrorState() {
  return <View><Text>Something went wrong. Retry.</Text></View>;
}
