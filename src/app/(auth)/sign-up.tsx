import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
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

const signUpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .pipe(z.email("Enter a valid email address")),
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

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const router = useRouter();

  const { control, handleSubmit, setFocus, getValues, trigger } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit((values) => {
    Keyboard.dismiss();
    console.log("Sign up values:", values);

    // TODO: call the sign up API with values.email / values.password,
    // and only continue once it succeeds.
    router.push({ pathname: "/verify-otp", params: { email: values.email } });
  });

  const goToSignIn = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/sign-in");
    }
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
          <Text style={styles.heading}>LET’S</Text>
          <Text style={styles.subheading}>
            GET YOU <Text style={styles.accent}>STARTED</Text>
          </Text>
          <Text style={styles.description}>
            Use your Waypoints at partner locations  for exclusive experience
          </Text>

          <Controller
            control={control}
            name="email"
            render={({
              field: { value, onChange, onBlur, ref },
              fieldState: { error },
            }) => (
              <View style={styles.emailField}>
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
                  returnKeyType="next"
                  onSubmitEditing={() => setFocus("password")}
                />
                {error ? <Text style={styles.error}>{error.message}</Text> : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({
              field: { value, onChange, onBlur, ref },
              fieldState: { error },
            }) => (
              <View style={styles.field}>
                <TextInput
                  ref={ref}
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    // Re-check the match when the password changes after confirming.
                    if (getValues("confirmPassword")) trigger("confirmPassword");
                  }}
                  onBlur={onBlur}
                  placeholder="Password"
                  placeholderTextColor={colors.placeholder}
                  style={[styles.input, error && styles.inputError]}
                  secureTextEntry
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
                  onSubmitEditing={onSubmit}
                />
                {error ? <Text style={styles.error}>{error.message}</Text> : null}
              </View>
            )}
          />

          <Button title="Sign up" onPress={onSubmit} style={styles.signUp} />

          <Text style={styles.footer}>
            Already have an account?{" "}
            <Text
              accessibilityRole="link"
              onPress={goToSignIn}
              style={styles.footerLink}
            >
              Sign In
            </Text>
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
  accent: {
    color: colors.brand,
  },
  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  emailField: {
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
  signUp: {
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