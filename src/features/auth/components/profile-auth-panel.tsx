import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SectionCard } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { sendEmailOtp, signOutUser, verifyEmailOtp } from '@/features/auth/services/auth-service';
import { useTheme } from '@/hooks/use-theme';

type AuthStep = 'email' | 'code';

function getAccountMonogram(value: string | null | undefined) {
  return value?.trim().charAt(0).toUpperCase() || 'G';
}

export function ProfileAuthPanel() {
  const theme = useTheme();
  const { isAuthenticated, isLoading, profile } = useAuth();
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canSendCode = normalizedEmail.includes('@') && normalizedEmail.includes('.');
  const canVerifyCode = code.trim().length === 6;

  async function handleSendCode() {
    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      await sendEmailOtp(normalizedEmail);
      setStep('code');
      setFeedback(`We sent a 6-digit sign-in code to ${normalizedEmail}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send code.';

      if (__DEV__) {
        console.error('[ProfileAuthPanel] Unable to send email OTP', {
          error,
          email: normalizedEmail,
        });
      }

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode() {
    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      await verifyEmailOtp(normalizedEmail, code);
      setFeedback('You are now signed in.');
      setCode('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify code.';

      if (__DEV__) {
        console.error('[ProfileAuthPanel] Unable to verify email OTP', {
          error,
          email: normalizedEmail,
        });
      }

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedback(null);

    try {
      await signOutUser();
      setStep('email');
      setEmail('');
      setCode('');
      setFeedback('You have been signed out.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out.';

      if (__DEV__) {
        console.error('[ProfileAuthPanel] Unable to sign out', {
          error,
        });
      }

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetCodeFlow() {
    setStep('email');
    setCode('');
    setErrorMessage(null);
    setFeedback(null);
  }

  if (isLoading) {
    return (
      <SectionCard
        title="Account"
        description="Checking whether you already have an active session on this device.">
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <ThemedText themeColor="textSecondary">Loading account state...</ThemedText>
        </View>
      </SectionCard>
    );
  }

  if (isAuthenticated) {
    const accountLabel = profile?.displayName || profile?.email || 'Geenie user';

    return (
      <SectionCard
        title="Account"
        description="Your saved bundles and listening preferences stay connected to this account.">
        <ThemedView type="background" style={styles.accountCard}>
          <View style={styles.accountIdentity}>
            <ThemedView type="backgroundSelected" style={styles.monogram}>
              <ThemedText type="smallBold">{getAccountMonogram(accountLabel)}</ThemedText>
            </ThemedView>
            <View style={styles.accountDetails}>
              <ThemedText type="smallBold">{accountLabel}</ThemedText>
              {profile?.email ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {profile.email}
                </ThemedText>
              ) : null}
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Signed in on this device
          </ThemedText>
        </ThemedView>

        <View style={styles.actionRow}>
          <Pressable
            onPress={handleSignOut}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.secondaryButtonPressable,
              pressed && !isSubmitting && styles.pressed,
            ]}>
            <ThemedView type="backgroundSelected" style={styles.secondaryButton}>
              <ThemedText type="smallBold">
                {isSubmitting ? 'Signing out...' : 'Sign out'}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </View>

        {errorMessage ? (
          <ThemedText themeColor="textSecondary">{errorMessage}</ThemedText>
        ) : null}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Sign in or create account"
      description="Guests can keep browsing. Sign in to keep saved bundles and playback preferences with you across devices.">
      <View style={styles.formColumn}>
        <View style={styles.fieldColumn}>
          <ThemedText type="smallBold">Email</ThemedText>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              {
                borderColor: theme.backgroundSelected,
                color: theme.text,
                backgroundColor: theme.background,
              },
            ]}
            value={email}
          />
        </View>

        {step === 'code' ? (
          <View style={styles.fieldColumn}>
            <ThemedText type="smallBold">6-digit code</ThemedText>
            <TextInput
              autoCapitalize="none"
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              onChangeText={setCode}
              placeholder="123456"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  borderColor: theme.backgroundSelected,
                  color: theme.text,
                  backgroundColor: theme.background,
                },
              ]}
              value={code}
            />
          </View>
        ) : null}

        <View style={styles.actionRow}>
          {step === 'email' ? (
            <Pressable
              disabled={isSubmitting || !canSendCode}
              onPress={handleSendCode}
              style={({ pressed }) => [
                styles.primaryButtonPressable,
                pressed && !isSubmitting && canSendCode && styles.pressed,
              ]}>
              <View
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      isSubmitting || !canSendCode
                        ? theme.backgroundSelected
                        : Colors.light.text,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{
                    color:
                      isSubmitting || !canSendCode
                        ? theme.textSecondary
                        : Colors.light.background,
                  }}>
                  {isSubmitting ? 'Sending code...' : 'Email me a code'}
                </ThemedText>
              </View>
            </Pressable>
          ) : (
            <>
              <Pressable
                disabled={isSubmitting || !canVerifyCode}
                onPress={handleVerifyCode}
                style={({ pressed }) => [
                  styles.primaryButtonPressable,
                  pressed && !isSubmitting && canVerifyCode && styles.pressed,
                ]}>
                <View
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor:
                        isSubmitting || !canVerifyCode
                          ? theme.backgroundSelected
                          : Colors.light.text,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={{
                      color:
                        isSubmitting || !canVerifyCode
                          ? theme.textSecondary
                          : Colors.light.background,
                    }}>
                    {isSubmitting ? 'Verifying...' : 'Verify code'}
                  </ThemedText>
                </View>
              </Pressable>

              <Pressable
                disabled={isSubmitting}
                onPress={resetCodeFlow}
                style={({ pressed }) => [
                  styles.secondaryButtonPressable,
                  pressed && !isSubmitting && styles.pressed,
                ]}>
                <ThemedView type="backgroundSelected" style={styles.secondaryButton}>
                  <ThemedText type="smallBold">Use another email</ThemedText>
                </ThemedView>
              </Pressable>
            </>
          )}
        </View>

        {feedback ? <ThemedText>{feedback}</ThemedText> : null}
        {errorMessage ? (
          <ThemedText themeColor="textSecondary">{errorMessage}</ThemedText>
        ) : null}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  formColumn: {
    gap: Spacing.three,
  },
  fieldColumn: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  primaryButtonPressable: {
    borderRadius: 999,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonPressable: {
    borderRadius: 999,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  accountCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  accountIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  monogram: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDetails: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.82,
  },
});
