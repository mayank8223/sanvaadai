import path from 'path';
import { fileURLToPath } from 'url';

import { getDefaultConfig } from 'expo/metro-config';
import { withNativeWind } from 'nativewind/metro';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = getDefaultConfig(__dirname);

export default withNativeWind(config, { input: './global.css' });
