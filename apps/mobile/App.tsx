import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthenticatedHome from './features/auth/AuthenticatedHome';
import LoginScreen from './features/auth/LoginScreen';
import useCollectorForms from './hooks/useCollectorForms';
import useAuthSession from './hooks/useAuthSession';

import './global.css';

const App = () => {
  const { isLoading, session, email, errorMessage, signIn, signOut } = useAuthSession();
  const {
    forms,
    isLoading: formsLoading,
    errorMessage: formsErrorMessage,
    refreshForms,
  } = useCollectorForms(session);

  return (
    <SafeAreaProvider>
      {session ? (
        <AuthenticatedHome
          email={email}
          onSignOut={signOut}
          forms={forms}
          formsLoading={formsLoading}
          formsErrorMessage={formsErrorMessage}
          onRefreshForms={refreshForms}
        />
      ) : (
        <LoginScreen isLoading={isLoading} errorMessage={errorMessage} onSubmit={signIn} />
      )}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
};

export default App;
