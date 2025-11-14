import { AppRegistry } from 'react-native';
import { LogBox } from 'react-native';

import { name as appName } from './app.json';
import App from './src/App';

LogBox.ignoreLogs(['InteractionManager has been deprecated']);

AppRegistry.registerComponent(appName, () => App);
