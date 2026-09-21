import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import TabNavigator from './TabNavigator';
import CaseDetailScreen from '@/screens/CaseDetailScreen';
import ChatScreen from '@/screens/ChatScreen';
import SuspectScreen from '@/screens/SuspectScreen';
import EndingScreen from '@/screens/EndingScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import DownloadsScreen from '@/screens/DownloadsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator(): JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="CaseDetail"
        component={CaseDetailScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen
        name="Suspects"
        component={SuspectScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Ending"
        component={EndingScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Downloads" component={DownloadsScreen} />
    </Stack.Navigator>
  );
}