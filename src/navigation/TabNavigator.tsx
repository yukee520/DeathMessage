import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabParamList } from '@/types/navigation';
import HomeScreen from '@/screens/HomeScreen';
import CaseListScreen from '@/screens/CaseListScreen';
import ClueBoardScreen from '@/screens/ClueBoardScreen';
import ProfileScreen from '@/screens/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

type IconName = 'home-outline' | 'home' | 'folder-open-outline' | 'folder-open' | 'search-outline' | 'search' | 'person-outline' | 'person';

interface TabIconProps {
  name: IconName;
  focused: boolean;
  color: string;
  size: number;
}

function TabIcon({ name, focused, color, size }: TabIconProps): JSX.Element {
  const resolved: IconName = focused
    ? (name.replace('-outline', '') as IconName)
    : name;
  return <Ionicons name={resolved} size={size} color={color} />;
}

export default function TabNavigator(): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
          height: 58 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="home-outline" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cases"
        component={CaseListScreen}
        options={{
          tabBarLabel: 'Cases',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="folder-open-outline" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Clues"
        component={ClueBoardScreen}
        options={{
          tabBarLabel: 'Clues',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="search-outline" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="person-outline" focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}