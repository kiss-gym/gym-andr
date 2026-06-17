import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  SessionHub: undefined;
  ActiveSession: { sessionId: string };
  SessionFinished: { sessionId: string };
  Exercise: { sessionId: string; exerciseId: string };
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type SessionHubScreenProps = NativeStackScreenProps<RootStackParamList, 'SessionHub'>;
export type ActiveSessionScreenProps = NativeStackScreenProps<RootStackParamList, 'ActiveSession'>;
export type SessionFinishedScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SessionFinished'
>;
export type ExerciseScreenProps = NativeStackScreenProps<RootStackParamList, 'Exercise'>;
