import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

import { colors } from "../../constants/theme";
import Button from "../Button";

const RESEND_SECONDS = 30;

const codeSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

type CodeValues = z.infer<typeof codeSchema>;

type CodeStepProps = {
  email: string;
  onVerified: () => void;
  onChangeEmail: () => void;
};

export default function CodeStep({ email, onVerified, onChangeEmail }: CodeStepProps) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const { control, handleSubmit } = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
    mode: "onTouched",
  });

  // Resend countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const verifyCode = handleSubmit((values) => {
    Keyboard.dismiss();
    console.log("Verification code values:", { email, ...values });

    // TODO: call the API to verify values.code for this email.
    onVerified();
  });

  const resendCode = () => {
    if (secondsLeft > 0) return;
    console.log("Resend code to:", email);

    // TODO: call the API to send a new code.
    setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <>
      <Controller
        control={control}
        name="code"
        render={({
          field: { value, onChange, onBlur, ref },
          fieldState: { error },
        }) => (
          <View style={styles.field}>
            <TextInput
              ref={ref}
              value={value}
              onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
              onBlur={onBlur}
              placeholder="6-digit code"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, error && styles.inputError]}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              returnKeyType="done"
              onSubmitEditing={verifyCode}
            />
            {error ? <Text style={styles.error}>{error.message}</Text> : null}
          </View>
        )}
      />

      <Button title="Verify code" onPress={verifyCode} style={styles.submit} />

      <Text style={styles.footer}>
        {secondsLeft > 0 ? (
          `Resend code in ${secondsLeft}s`
        ) : (
          <>
            Didn’t get the code?{" "}
            <Text accessibilityRole="link" onPress={resendCode} style={styles.footerLink}>
              Resend
            </Text>
          </>
        )}
      </Text>

      <Text style={styles.secondaryFooter}>
        Wrong email?{" "}
        <Text accessibilityRole="link" onPress={onChangeEmail} style={styles.footerLink}>
          Change
        </Text>
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: 36,
  },
  input: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 8,
    color: colors.ink,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 13,
    color: colors.error,
  },
  submit: {
    height: 49,
    marginTop: 21,
    borderRadius: 12,
  },
  footer: {
    marginTop: 36,
    textAlign: "center",
    fontSize: 15,
    color: colors.muted,
  },
  secondaryFooter: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 15,
    color: colors.muted,
  },
  footerLink: {
    fontWeight: "800",
    color: colors.ink,
  },
});