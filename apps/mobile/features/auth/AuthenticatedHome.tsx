import { Text, View } from 'react-native';

import { AppButton, Screen } from '../../components';
import { APP_TAGLINE, AUTH_COPY } from '../../constants';
import FormsScreen, { type FormsScreenItem } from '../forms/FormsScreen';

export type AuthenticatedHomeProps = {
  email: string;
  onSignOut: () => Promise<void>;
  forms: FormsScreenItem[];
  formsLoading: boolean;
  formsErrorMessage: string | null;
  onRefreshForms: () => Promise<void>;
};

const AuthenticatedHome = ({
  email,
  onSignOut,
  forms,
  formsLoading,
  formsErrorMessage,
  onRefreshForms,
}: AuthenticatedHomeProps) => (
  <Screen className="px-6">
    <View className="w-full gap-4 py-6">
      <Text className="text-xl font-semibold text-foreground">{AUTH_COPY.welcomeTitle}</Text>
      <Text className="text-sm text-muted-foreground">{APP_TAGLINE}</Text>
      <Text className="text-sm text-foreground">{email}</Text>
      <FormsScreen
        forms={forms}
        isLoading={formsLoading}
        errorMessage={formsErrorMessage}
        onRefresh={onRefreshForms}
      />
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
