import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ImageIcon } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
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

const MAX_PHOTO_MB = 24;

const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .min(2, "First name is too short"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .min(2, "Last name is too short"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^\+?[\d\s-]+$/, "Enter a valid phone number")
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    }, "Enter a valid phone number"),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function CompleteProfile() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const { control, handleSubmit, setFocus } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", phone: "" },
    mode: "onTouched",
  });

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    if (asset.fileSize && asset.fileSize > MAX_PHOTO_MB * 1024 * 1024) {
      setPhotoError(`Photo must be ${MAX_PHOTO_MB}mb or less`);
      return;
    }

    setPhotoError(null);
    setPhoto(asset.uri);
  };

  const onSubmit = handleSubmit((values) => {
    Keyboard.dismiss();
    console.log("Profile values:", { photo, ...values });

    // TODO: upload the photo and save the profile, and only continue once it succeeds.
    router.replace("/enable-location");
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
          <Text style={styles.heading}>LET’S</Text>
          <Text style={styles.subheading} numberOfLines={1} adjustsFontSizeToFit>
            KNOW YOU BETTER
          </Text>
          <Text style={styles.description}>Complete your profile to get started</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Upload profile photo"
            onPress={pickPhoto}
            style={styles.photoRow}
          >
            <View style={styles.photoBox}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <ImageIcon size={22} strokeWidth={1.5} color={colors.muted} />
              )}
            </View>

            <View>
              <Text style={styles.photoTitle}>Upload profile photo</Text>
              <Text style={styles.photoHint}>{MAX_PHOTO_MB}mb max</Text>
            </View>
          </Pressable>
          {photoError ? <Text style={styles.error}>{photoError}</Text> : null}

          <Controller
            control={control}
            name="firstName"
            render={({
              field: { value, onChange, onBlur, ref },
              fieldState: { error },
            }) => (
              <View style={styles.firstField}>
                <TextInput
                  ref={ref}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="First name"
                  placeholderTextColor={colors.placeholder}
                  style={[styles.input, error && styles.inputError]}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="given-name"
                  textContentType="givenName"
                  returnKeyType="next"
                  onSubmitEditing={() => setFocus("lastName")}
                />
                {error ? <Text style={styles.error}>{error.message}</Text> : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="lastName"
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
                  placeholder="Last name"
                  placeholderTextColor={colors.placeholder}
                  style={[styles.input, error && styles.inputError]}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="family-name"
                  textContentType="familyName"
                  returnKeyType="next"
                  onSubmitEditing={() => setFocus("phone")}
                />
                {error ? <Text style={styles.error}>{error.message}</Text> : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="phone"
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
                  placeholder="Phone number"
                  placeholderTextColor={colors.placeholder}
                  style={[styles.input, error && styles.inputError]}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                />
                {error ? <Text style={styles.error}>{error.message}</Text> : null}
              </View>
            )}
          />

          <Button title="Proceed" onPress={onSubmit} style={styles.submit} />
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
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 36,
  },
  photoBox: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.ink,
  },
  photoHint: {
    marginTop: 3,
    fontSize: 11,
    color: colors.muted,
  },
  firstField: {
    marginTop: 22,
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
    marginTop: 30,
    borderRadius: 12,
  },
});