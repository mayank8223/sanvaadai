import { Text, View } from 'react-native';

import { AppButton, Screen } from '../../components';
import { APP_TAGLINE, AUTH_COPY } from '../../constants';

export type AuthenticatedHomeProps = {
  email: string;
  onSignOut: () => Promise<void>;
};

const AuthenticatedHome = ({ email, onSignOut }: AuthenticatedHomeProps) => (
  <Screen className="justify-center px-6">
    <View className="w-full gap-4">
      <Text className="text-xl font-semibold text-foreground">{AUTH_COPY.welcomeTitle}</Text>
      <Text className="text-sm text-muted-foreground">{APP_TAGLINE}</Text>
      <Text className="text-sm text-foreground">{email}</Text>
      <AppButton
        accessibilityLabel="Sign out"
        label={AUTH_COPY.signOutLabel}
        variant="outline"
        onPress={onSignOut}
      />
    </View>
  </Screen>
);

export default AuthenticatedHome;
