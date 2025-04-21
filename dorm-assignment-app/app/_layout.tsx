import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import KeyboardDismissWrapper from "@/components/common/KeyboardDismissWrapper";
import { useColorScheme } from "@/hooks/useColorScheme";
import { View } from "react-native";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <KeyboardDismissWrapper>
        <StatusBar style="auto" />
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: "horizontal",
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="application/[id]"
              options={{ headerShown: true, title: "Application Detail" }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </View>
      </KeyboardDismissWrapper>
    </ThemeProvider>
  );
}
