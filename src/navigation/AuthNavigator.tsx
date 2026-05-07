import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen }  from '../screens/WelcomeScreen';
import { LoginScreen }    from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

export type AuthStackParamList = {
  Welcome:  undefined;
  Login:    undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{ 
        headerShown: false, 
        animation: 'slide_from_right' 
      }}
    >
      <Stack.Screen name="Welcome">
        {(props) => (
          <WelcomeScreen 
            onLoginPress={() => props.navigation.navigate('Login')}
            onRegisterPress={() => props.navigation.navigate('Register')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login"    component={LoginScreen}    />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
