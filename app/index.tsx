import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenEntrance } from "@/components/ui/ScreenEntrance";
import { Button } from "@/components/ui/Button";

import { Logo } from "@/components/ui/Logo";

import { motion } from "@/constants/motion";
import { colors, radius, spacing } from "@/constants/theme";

import { useUserContext } from "@/contexts/UserProvider";

import { isApiConfigured } from "@/lib/api/client";

type EntryMode = "create" | "login";

const MODE_TAB_PADDING = 4;
const WELCOME_INPUT_ROW_HEIGHT = 48;

interface ModeTabsProps {
  mode: EntryMode;
  onModeChange: (mode: EntryMode) => void;
}

function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  const [tabWidth, setTabWidth] = useState(0);
  const activeIndex = useSharedValue(mode === "create" ? 0 : 1);

  useEffect(() => {
    activeIndex.value = withTiming(mode === "create" ? 0 : 1, {
      duration: motion.normal,
      easing: motion.easing,
    });
  }, [activeIndex, mode]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeIndex.value * tabWidth }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const innerWidth = event.nativeEvent.layout.width - MODE_TAB_PADDING * 2;
    setTabWidth(innerWidth / 2);
  };

  return (
    <View style={styles.modeTabs} onLayout={handleLayout}>
      {tabWidth > 0 ? (
        <Animated.View
          style={[styles.modeTabIndicator, { width: tabWidth }, indicatorStyle]}
        />
      ) : null}
      <Pressable style={styles.modeTab} onPress={() => onModeChange("create")}>
        <Text
          style={[
            styles.modeTabText,
            mode === "create" && styles.modeTabTextActive,
          ]}
        >
          새 계정
        </Text>
      </Pressable>
      <Pressable style={styles.modeTab} onPress={() => onModeChange("login")}>
        <Text
          style={[
            styles.modeTabText,
            mode === "login" && styles.modeTabTextActive,
          ]}
        >
          기존 계정 접속
        </Text>
      </Pressable>
    </View>
  );
}

export default function NicknameScreen() {
  const { user, isLoading, createUser, loginUser, entryMode, setEntryMode } =
    useUserContext();

  const [mode, setMode] = useState<EntryMode>(entryMode);

  const [input, setInput] = useState("");

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(entryMode);
  }, [entryMode]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingText}>불러오는 중...</Text>
      </View>
    );
  }

  if (user && entryMode !== "login") {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleSubmit = async () => {
    setSubmitting(true);

    setError("");

    const result =
      mode === "create" ? await createUser(input) : await loginUser(input);

    setSubmitting(false);

    if (!result.success) {
      setError(result.message);

      return;
    }

    setEntryMode("create");
  };

  const switchMode = (nextMode: EntryMode) => {
    setMode(nextMode);

    setInput("");

    setError("");
  };

  const placeholder =
    mode === "create" ? "사용할 닉네임을 입력해 주세요." : "닉네임#1234";

  const maxLength = mode === "create" ? 12 : 20;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenEntrance style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <Logo size="lg" />

            <Text style={styles.welcome}>환영합니다!</Text>

            <ModeTabs mode={mode} onModeChange={switchMode} />

            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                maxLength={maxLength}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (submitting || isLoading) return;
                  void handleSubmit();
                }}
              />

              <Button
                label={mode === "create" ? "시작하기" : "접속하기"}
                compact
                onPress={() => void handleSubmit()}
                disabled={submitting || isLoading}
                style={styles.submitButton}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.infoBox}>
              {mode === "create" ? (
                <>
                  <Text style={styles.infoTitle}>닉네임 안내</Text>

                  <Text style={styles.infoText}>
                    • 2~12자, 한글/영문/숫자 사용 가능
                  </Text>

                  <Text style={styles.infoText}>
                    • 닉네임#1234 형태로 자동 생성됩니다
                  </Text>

                  <Text style={styles.infoText}>
                    • 같은 닉네임도 tag가 달라 구분됩니다
                  </Text>

                  <Text style={styles.infoExample}>예: 민수 → 민수#4821</Text>
                </>
              ) : (
                <>
                  <Text style={styles.infoTitle}>기존 계정 접속</Text>

                  <Text style={styles.infoText}>
                    • 메인 화면에 표시된 닉네임#1234를 입력하세요
                  </Text>

                  <Text style={styles.infoText}>
                    • 다른 기기·브라우저에서도 동일하게 접속할 수 있습니다
                  </Text>

                  {!isApiConfigured ? (
                    <Text style={styles.infoWarning}>
                      서버 미연동 상태에서는 기기 간 접속이 불가합니다.
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,

    backgroundColor: colors.background,

    alignItems: "center",

    justifyContent: "center",

    gap: 12,
  },

  loadingText: {
    fontSize: 14,

    color: colors.textSecondary,
  },

  safe: {
    flex: 1,

    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  container: {
    flexGrow: 1,

    width: "100%",

    padding: spacing.lg,

    paddingTop: spacing.xl,

    justifyContent: "flex-start",
  },

  welcome: {
    marginTop: spacing.xl,

    fontSize: 28,

    fontWeight: "700",

    color: colors.text,

    marginBottom: spacing.lg,
  },

  modeTabs: {
    flexDirection: "row",

    position: "relative",

    backgroundColor: colors.border,

    borderRadius: radius.md,

    padding: MODE_TAB_PADDING,

    marginBottom: spacing.md,

    overflow: "hidden",
  },

  modeTabIndicator: {
    position: "absolute",

    top: MODE_TAB_PADDING,

    left: MODE_TAB_PADDING,

    bottom: MODE_TAB_PADDING,

    backgroundColor: colors.surface,

    borderRadius: radius.sm,
  },

  modeTab: {
    flex: 1,

    paddingVertical: 10,

    borderRadius: radius.sm,

    alignItems: "center",

    zIndex: 1,
  },

  modeTabText: {
    fontSize: 14,

    fontWeight: "600",

    color: colors.textSecondary,
  },

  modeTabTextActive: {
    color: colors.primary,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm,
  },

  input: {
    flex: 1,
    height: WELCOME_INPUT_ROW_HEIGHT,

    backgroundColor: colors.surface,

    borderWidth: 1,

    borderColor: colors.border,

    borderRadius: radius.md,

    paddingHorizontal: spacing.md,

    paddingVertical: 0,

    fontSize: 16,

    color: colors.textSecondary,
  },

  submitButton: {
    flexShrink: 0,
    height: WELCOME_INPUT_ROW_HEIGHT,
    borderRadius: radius.md,
    paddingVertical: 0,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },

  error: {
    marginTop: spacing.sm,

    color: colors.danger,
  },

  infoBox: {
    marginTop: spacing.lg,

    backgroundColor: "#F1F5F9",

    borderRadius: radius.md,

    padding: spacing.md,

    gap: 6,
  },

  infoTitle: {
    fontSize: 14,

    fontWeight: "700",

    color: colors.text,

    marginBottom: 4,
  },

  infoText: {
    fontSize: 13,

    color: colors.textSecondary,

    lineHeight: 20,
  },

  infoExample: {
    marginTop: 4,

    fontSize: 13,

    fontWeight: "600",

    color: colors.primary,
  },

  infoWarning: {
    marginTop: 4,

    fontSize: 13,

    fontWeight: "600",

    color: colors.danger,

    lineHeight: 20,
  },
});
