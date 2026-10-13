import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email address")),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignIn() {
  const router = useRouter();

  const { control, handleSubmit, setFocus } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit((values) => {
    Keyboard.dismiss();
    console.log("Sign in values:", values);

    // TODO: call the auth API with values.email / values.password,
    // then router.replace() to the first screen after sign in.
  });

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
          <Text style={styles.heading}>HEY,</Text>
          <Text style={styles.subheading}>
            WELCOME <Text style={styles.accent}>BACK</Text>
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
              <View style={styles.passwordField}>
                <TextInput
                  ref={ref}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Password"
                  placeholderTextColor={colors.placeholder}
                  style={[styles.input, error && styles.inputError]}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                />
                {error ? <Text style={styles.error}>{error.message}</Text> : null}
              </View>
            )}
          />

          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/forgot-password")}
            style={styles.forgot}
          >
            <Text style={styles.forgotLabel}>Forgot password ?</Text>
          </Pressable>

          <Button title="Sign in" onPress={onSubmit} style={styles.signIn} />

          <Text style={styles.footer}>
            Dont have an account?{" "}
            <Text
              accessibilityRole="link"
              onPress={() => router.push("/sign-up")}
              style={styles.footerLink}
            >
              Sign Up
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
  passwordField: {
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
  forgot: {
    alignSelf: "center",
    marginTop: 4,
    paddingVertical: 6,
  },
  forgotLabel: {
    fontSize: 15,
    color: colors.muted,
  },
  signIn: {
    height: 49,
    marginTop: 15,
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