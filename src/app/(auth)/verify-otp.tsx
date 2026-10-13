import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import Button from "../../components/Button";
import { colors } from "../../constants/theme";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const otpSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code`),
});

type OtpValues = z.infer<typeof otpSchema>;

export default function VerifyOtp() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [focused, setFocused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const { control, handleSubmit } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
    mode: "onTouched",
  });

  // Resend countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const onSubmit = handleSubmit((values) => {
    Keyboard.dismiss();
    console.log("OTP values:", { email, ...values });

    // TODO: call the API to verify values.code for this email, and only continue once it succeeds.
    router.replace("/complete-profile");
  });

  const resendCode = () => {
    if (secondsLeft > 0) return;
    console.log("Resend OTP to:", email);

    // TODO: call the API to send a new code.
    setSecondsLeft(RESEND_SECONDS);
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
          <Text style={styles.heading}>EMAIL</Text>
          <Text style={styles.subheading}>OTP VERIFICATION</Text>
          <Text style={styles.description}>
            We’ve sent a {OTP_LENGTH}-digits code to your email
          </Text>

          <Controller
            control={control}
            name="code"
            render={({
              field: { value, onChange, onBlur, ref },
              fieldState: { error },
            }) => {
              const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

              return (
                <View style={styles.otpField}>
                  <View style={styles.boxes}>
                    {Array.from({ length: OTP_LENGTH }, (_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.box,
                          focused && i === activeIndex && styles.boxActive,
                          error && styles.boxError,
                        ]}
                      >
                        <Text style={value[i] ? styles.digit : styles.placeholder}>
                          {value[i] ?? "0"}
                        </Text>
                      </View>
                    ))}

                    {/* Invisible input on top of the boxes: taps focus it, and it handles
                        typing, paste and the SMS code autofill. */}
                    <TextInput
                      ref={ref}
                      value={value}
                      onChangeText={(text) =>
                        onChange(text.replace(/\D/g, "").slice(0, OTP_LENGTH))
                      }
                      onFocus={() => setFocused(true)}
                      onBlur={() => {
                        setFocused(false);
                        onBlur();
                      }}
                      maxLength={OTP_LENGTH}
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      autoComplete="sms-otp"
                      autoFocus
                      caretHidden
                      returnKeyType="done"
                      onSubmitEditing={onSubmit}
                      style={styles.hiddenInput}
                    />
                  </View>

                  {error ? <Text style={styles.error}>{error.message}</Text> : null}
                </View>
              );
            }}
          />

          <Button title="Sign up" onPress={onSubmit} style={styles.submit} />

          <Text style={styles.footer}>
            {secondsLeft > 0 ? (
              `Resend code in ${secondsLeft}s`
            ) : (
              <>
                Didn’t receive code?{" "}
                <Text
                  accessibilityRole="link"
                  onPress={resendCode}
                  style={styles.footerLink}
                >
                  Resend
                </Text>
              </>
            )}
          </Text>
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
  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  otpField: {
    marginTop: 36,
  },
  boxes: {
    flexDirection: "row",
    gap: 10,
  },
  box: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
  },
  boxActive: {
    borderColor: colors.brand,
  },
  boxError: {
    borderColor: colors.error,
  },
  digit: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  placeholder: {
    fontSize: 18,
    color: colors.placeholder,
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  error: {
    marginTop: 8,
    marginLeft: 4,
    fontSize: 13,
    color: colors.error,
  },
  submit: {
    height: 49,
    marginTop: 36,
    borderRadius: 12,
  },
  footer: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 15,
    color: colors.muted,
  },
  footerLink: {
    fontWeight: "800",
    color: colors.ink,
  },
});