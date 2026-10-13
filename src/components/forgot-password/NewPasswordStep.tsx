import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

import { colors } from "../../constants/theme";
import Button from "../Button";

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

type NewPasswordStepProps = {
  email: string;
  onDone: () => void;
};

export default function NewPasswordStep({ email, onDone }: NewPasswordStepProps) {
  const { control, handleSubmit, setFocus, getValues, trigger } =
    useForm<NewPasswordValues>({
      resolver: zodResolver(newPasswordSchema),
      defaultValues: { password: "", confirmPassword: "" },
      mode: "onTouched",
    });

  const resetPassword = handleSubmit((values) => {
    Keyboard.dismiss();
    console.log("New password values:", { email, ...values });

    // TODO: call the API to set the new password.
    onDone();
  });

  return (
    <>
      <Controller
        control={control}
        name="password"
        render={({
          field: { value, onChange, onBlur, ref },
          fieldState: { error },
        }) => (
          <View style={styles.firstField}>
            <TextInput
              ref={ref}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                // Re-check the match when the password changes after confirming.
                if (getValues("confirmPassword")) trigger("confirmPassword");
              }}
              onBlur={onBlur}
              placeholder="New password"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, error && styles.inputError]}
              secureTextEntry
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => setFocus("confirmPassword")}
            />
            {error ? <Text style={styles.error}>{error.message}</Text> : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
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
              placeholder="Confirm Password"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, error && styles.inputError]}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={resetPassword}
            />
            {error ? <Text style={styles.error}>{error.message}</Text> : null}
          </View>
        )}
      />

      <Button title="Reset password" onPress={resetPassword} style={styles.submit} />
    </>
  );
}

const styles = StyleSheet.create({
  firstField: {
    marginTop: 36,
  },
  field: {
    marginTop: 18,
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
});