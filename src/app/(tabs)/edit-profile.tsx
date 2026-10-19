import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Camera, Lock } from "lucide-react-native";
import { useCallback, useState } from "react";
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
import { updateProfile, useProfile } from "../../store/profile";

const editProfileSchema = z.object({
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

type EditProfileValues = z.infer<typeof editProfileSchema>;

export default function EditProfile() {
  const router = useRouter();
  const profile = useProfile();

  // The new photo is only saved when the user taps "Save changes".
  const [photo, setPhoto] = useState<string | null>(profile.photo);

  const { control, handleSubmit, setFocus, reset } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
    },
    mode: "onTouched",
  });

  // This screen stays mounted, so refill it with the saved profile each time it opens.
  useFocusEffect(
    useCallback(() => {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      setPhoto(profile.photo);
    }, [profile, reset])
  );

  const goBack = () => {
    Keyboard.dismiss();
    if (router.canGoBack()) router.back();
    else router.navigate("/profile");
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    setPhoto(result.assets[0].uri);
  };

  const onSubmit = handleSubmit((values) => {
    // TODO: save the profile (and upload the photo) through the API.
    updateProfile({ ...values, photo });
    goBack();
  });

  const initial = (profile.firstName.charAt(0) || "?").toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={goBack}
            style={styles.back}
          >
            <ArrowLeft size={22} strokeWidth={2} color={colors.ink} />
          </Pressable>

          <Text style={styles.title}>EDIT PROFILE</Text>

          <View style={styles.photoSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.initial}>{initial}</Text>
                )}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change photo"
                onPress={pickPhoto}
                style={styles.camera}
              >
                <Camera size={18} strokeWidth={1.75} color={colors.black} />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={pickPhoto}
              style={({ pressed }) => [styles.changePhoto, pressed && styles.pressed]}
            >
              <Text style={styles.changePhotoLabel}>Change photo</Text>
            </Pressable>
          </View>

          <Controller
            control={control}
            name="firstName"
            render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
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
            render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
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

          <View style={styles.field}>
            <View style={[styles.input, styles.locked]}>
              <Text style={styles.lockedText} numberOfLines={1}>
                {profile.email}
              </Text>
              <Lock size={20} strokeWidth={1.75} color={colors.black} />
            </View>
            <Text style={styles.hint}>Email cannot be changed for security</Text>
          </View>

          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
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

          <View style={styles.spacer} />

          <Button title="Save changes" onPress={onSubmit} style={styles.save} />
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
    paddingTop: 30,
    paddingBottom: 24,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    marginTop: 26,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.black,
  },
  photoSection: {
    alignItems: "center",
    marginTop: 22,
  },
  avatarRing: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  avatar: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 36,
    backgroundColor: colors.brand,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  initial: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.black,
  },
  camera: {
    position: "absolute",
    right: -8,
    bottom: 2,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.brand,
    backgroundColor: colors.white,
  },
  changePhoto: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#ECECEC",
  },
  pressed: {
    opacity: 0.7,
  },
  changePhotoLabel: {
    fontSize: 13,
    color: colors.ink,
  },
  firstField: {
    marginTop: 30,
  },
  field: {
    marginTop: 14,
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
  locked: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  lockedText: {
    flex: 1,
    fontSize: 16,
    letterSpacing: 0.8,
    color: colors.ink,
  },
  hint: {
    marginTop: 8,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.muted,
  },
  error: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 13,
    color: colors.error,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  save: {
    height: 52,
    borderRadius: 12,
  },
});