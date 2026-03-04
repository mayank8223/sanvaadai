import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthenticatedHome from './features/auth/AuthenticatedHome';
import LoginScreen from './features/auth/LoginScreen';
import useAuthSession from './hooks/useAuthSession';

import './global.css';

const App = () => {
  const { isLoading, session, email, errorMessage, signIn, signOut } = useAuthSession();

  return (
    <SafeAreaProvider>
      {session ? (
        <AuthenticatedHome email={email} onSignOut={signOut} />
      ) : (
        <LoginScreen
          isLoading={isLoading}
          errorMessage={errorMessage}
          onSubmit={signIn}
        />
      )}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
};

export default App;
