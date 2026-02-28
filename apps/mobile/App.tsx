import { StatusBar } from 'expo-status-bar';
import { CheckCircle2Icon } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppButton, AppInput, Icon, Screen } from './components';
import { APP_NAME, APP_TAGLINE } from './constants';

import './global.css';

const App = () => (
  <SafeAreaProvider>
    <Screen className="items-center justify-center px-6">
      <Icon as={CheckCircle2Icon} size={48} color="#22c55e" />
      <AppInput
        placeholder="Sample input"
        editable={false}
        className="mt-4 w-full max-w-xs"
      />
      <AppButton
        label={APP_NAME}
        variant="default"
        className="mt-4 min-w-[200px]"
      />
      <AppButton
        label={APP_TAGLINE}
        variant="outline"
        size="sm"
        className="mt-2"
      />
      <StatusBar style="auto" />
    </Screen>
  </SafeAreaProvider>
);

export default App;
