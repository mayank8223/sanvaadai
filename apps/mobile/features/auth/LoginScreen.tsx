import { ActivityIndicator, Text, View } from 'react-native';

import { AppButton, AppInput, Screen } from '../../components';
import { APP_NAME, AUTH_COPY } from '../../constants';
import useLoginForm from '../../hooks/useLoginForm';

export type LoginScreenProps = {
  isLoading?: boolean;
  errorMessage?: string | null;
  onSubmit: (input: { email: string; password: string }) => Promise<void>;
};

const LoginScreen = ({ isLoading = false, errorMessage = null, onSubmit }: LoginScreenProps) => {
  const { email, password, setEmail, setPassword, handleSubmit, canSubmit } = useLoginForm({
    onSubmit,
  });

  return (
    <Screen className="justify-center px-6">
      <View className="w-full gap-4">
        <View className="gap-2">
          <Text className="text-2xl font-semibold text-foreground">{APP_NAME}</Text>
          <Text className="text-sm text-muted-foreground">{AUTH_COPY.loginSubtitle}</Text>
        </View>

        <AppInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder={AUTH_COPY.emailPlaceholder}
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />

        <AppInput
          accessibilityLabel="Password"
          autoCapitalize="none"
          autoComplete="password"
          placeholder={AUTH_COPY.passwordPlaceholder}
          secureTextEntry
          textContentType="password"
          value={password}
          onChangeText={setPassword}
        />

        {errorMessage ? (
          <Text accessibilityLiveRegion="polite" className="text-sm text-red-500">
            {errorMessage}
          </Text>
        ) : null}

        <AppButton
          accessibilityLabel="Sign in"
          disabled={!canSubmit || isLoading}
          label={isLoading ? AUTH_COPY.signingInLabel : AUTH_COPY.signInLabel}
          onPress={handleSubmit}
        />

        {isLoading ? (
          <ActivityIndicator accessibilityLabel="Signing in" className="self-center" />
        ) : null}
      </View>
    </Screen>
  );
};

export default LoginScreen;
