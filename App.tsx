import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native';
import List from './app/screens/List';
import Login from './app/screens/Login';
import SignUp from './app/screens/SignUp';
import GameDetails from './app/screens/GameDetails';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Sign Up" component={SignUp} />
        <Stack.Screen name="Platinum Games" component={List} />
        <Stack.Screen name="Game Details" component={GameDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
