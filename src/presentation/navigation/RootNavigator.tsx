import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@presentation/context/AuthContext';
import { useTheme } from '@presentation/theme';
import { AppSplashScreen } from '@presentation/components/AppSplashScreen';
import { LoginScreen } from '@presentation/screens/LoginScreen';
import { RegisterScreen } from '@presentation/screens/RegisterScreen';
import { SessionHubScreen } from '@presentation/screens/SessionHubScreen';
import { ActiveSessionScreen } from '@presentation/screens/ActiveSessionScreen';
import { SessionFinishedScreen } from '@presentation/screens/SessionFinishedScreen';
import { ExerciseScreen } from '@presentation/screens/ExerciseScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();
  const theme = useTheme();

  if (isLoading) {
    return <AppSplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        {user === null ? (
          // ── Auth stack ────────────────────────────────────────────────────
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // ── App stack ─────────────────────────────────────────────────────
          <>
            <Stack.Screen name="SessionHub" component={SessionHubScreen} />
            <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} />
            <Stack.Screen name="SessionFinished" component={SessionFinishedScreen} />
            <Stack.Screen name="Exercise" component={ExerciseScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
