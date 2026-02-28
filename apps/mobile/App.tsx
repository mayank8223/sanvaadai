import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { APP_NAME, APP_TAGLINE } from './constants';

const App = () => (
  <View style={styles.container}>
    <Text style={styles.title}>{APP_NAME}</Text>
    <Text style={styles.tagline}>{APP_TAGLINE}</Text>
    <StatusBar style="auto" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
  },
});

export default App;
