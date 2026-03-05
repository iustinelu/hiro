import React from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { appShellSections, type AppShellSectionId } from "@hiro/domain";
import { MobileButton } from "@hiro/ui-primitives/mobile";
import { tokens } from "@hiro/ui-tokens";
import { SectionPlaceholderScreen } from "../screens/SectionPlaceholderScreen";

type AppTabParamList = Record<AppShellSectionId, undefined>;

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="home"
        screenOptions={({ route }) => {
          const section = appShellSections.find((item) => item.id === route.name);
          return {
            headerStyle: {
              backgroundColor: tokens.color.bgElevated
            },
            headerTitleStyle: {
              color: tokens.color.ink,
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.titleSize,
              fontWeight: "700"
            },
            headerTitleAlign: "left",
            headerTintColor: tokens.color.ink,
            headerRight: () => (
              <View
                style={{
                  marginRight: tokens.spacing.md,
                  minWidth: 120
                }}
              >
                <MobileButton label={section?.headerActionLabel ?? "Action"} variant="secondary" size="sm" />
              </View>
            ),
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
              backgroundColor: tokens.color.bgElevated,
              borderTopColor: tokens.color.border,
              borderTopWidth: 1,
              paddingTop: tokens.spacing.sm,
              paddingBottom: Math.max(tokens.spacing.sm, insets.bottom),
              minHeight: 64 + insets.bottom
            },
            tabBarLabelStyle: {
              fontFamily: tokens.typography.fontFamilyMono,
              fontSize: tokens.typography.labelSize,
              textTransform: "uppercase"
            },
            tabBarActiveTintColor: tokens.color.accent,
            tabBarInactiveTintColor: tokens.color.inkMuted,
            tabBarIcon: ({ focused, color }) => (
              <Text
                style={{
                  marginBottom: tokens.spacing.xs,
                  color,
                  fontSize: 12,
                  lineHeight: 14
                }}
              >
                {focused ? "●" : "○"}
              </Text>
            ),
            sceneStyle: {
              backgroundColor: tokens.color.bg
            }
          };
        }}
      >
        {appShellSections.map((section) => (
          <Tab.Screen
            key={section.id}
            name={section.id}
            options={{
              title: section.label,
              tabBarLabel: section.label
            }}
          >
            {() => (
              <SectionPlaceholderScreen
                title={section.label}
                description={`${section.label} section shell`}
                actionLabel={section.headerActionLabel}
              />
            )}
          </Tab.Screen>
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
