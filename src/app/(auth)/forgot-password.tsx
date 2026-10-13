import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CodeStep from "../../components/forgot-password/CodeStep";
import EmailStep from "../../components/forgot-password/EmailStep";
import NewPasswordStep from "../../components/forgot-password/NewPasswordStep";
import { colors } from "../../constants/theme";

type Step = "email" | "code" | "password";

export default function ForgotPassword() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  const goToSignIn = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/sign-in");
    }
  };

  const copy =
    step === "email"
      ? {
          title: "FORGOT",
          lead: "YOUR ",
          accent: "PASSWORD",
          description:
            "Enter the email linked to your account and we will send you a code to reset your password",
        }
      : step === "code"
        ? {
            title: "ENTER",
            lead: "THE ",
            accent: "CODE",
            description: `We sent a 6-digit code to ${email}. Enter it below to continue`,
          }
        : {
            title: "RESET",
            lead: "YOUR ",
            accent: "PASSWORD",
            description: "Create a new password for your account",
          };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>{copy.title}</Text>
          <Text style={styles.subheading}>
            {copy.lead}
            <Text style={styles.accent}>{copy.accent}</Text>
          </Text>
          <Text style={styles.description}>{copy.description}</Text>

          {step === "email" && (
            <EmailStep
              onSubmit={(value) => {
                setEmail(value);
                setStep("code");
              }}
              onSignIn={goToSignIn}
            />
          )}

          {step === "code" && (
            <CodeStep
              email={email}
              onVerified={() => setStep("password")}
              onChangeEmail={() => setStep("email")}
            />
          )}

          {step === "password" && (
            <NewPasswordStep email={email} onDone={() => router.replace("/sign-in")} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 23,
    paddingTop: 96,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 54,
    lineHeight: 54,
    fontWeight: "900",
    letterSpacing: -1,
    color: colors.ink,
  },
  subheading: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.ink,
  },
  accent: {
    color: colors.brand,
  },
  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
});