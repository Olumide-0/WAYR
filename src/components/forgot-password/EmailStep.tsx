import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

import { colors } from "../../constants/theme";
import Button from "../Button";

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email address")),
});

type EmailValues = z.infer<typeof emailSchema>;

type EmailStepProps = {
  onSubmit: (email: string) => void;
  onSignIn: () => void;
};

export default function EmailStep({ onSubmit, onSignIn }: EmailStepProps) {
  const { control, handleSubmit } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const sendCode = handleSubmit((values) => {
    Keyboard.dismiss();
    console.log("Forgot password values:", values);

    // TODO: call the API to email a 6-digit code to values.email.
    onSubmit(values.email);
  });

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({
          field: { value, onChange, onBlur, ref },
          fieldState: { error },
        }) => (
          <View style={styles.field}>
            <TextInput
              ref={ref}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Email"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, error && styles.inputError]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={sendCode}
            />
            {error ? <Text style={styles.error}>{error.message}</Text> : null}
          </View>
        )}
      />

      <Button title="Send code" onPress={sendCode} style={styles.submit} />

      <Text style={styles.footer}>
        Remember your password?{" "}
        <Text accessibilityRole="link" onPress={onSignIn} style={styles.footerLink}>
          Sign In
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
    fontSize: 16,
    letterSpacing: 0.8,
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
  footerLink: {
    fontWeight: "800",
    color: colors.ink,
  },
});