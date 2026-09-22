import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import type { TabParamList } from '@/types/navigation';
import HomeScreen from '@/screens/HomeScreen';
import CaseListScreen from '@/screens/CaseListScreen';
import ClueBoardScreen from '@/screens/ClueBoardScreen';
import ProfileScreen from '@/screens/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

type IconName =
  | 'home-outline'
  | 'home'
  | 'folder-open-outline'
  | 'folder-open'
  | 'search-outline'
  | 'search'
  | 'person-outline'
  | 'person';

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
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const bg = isDark ? '#1E293B' : '#FFFFFF';
  const border = isDark ? '#334155' : '#E2E8F0';
  const active = '#2563EB';
  const inactive = isDark ? '#64748B' : '#94A3B8';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
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
          tabBarLabel: '首页',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="home-outline" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cases"
        component={CaseListScreen}
        options={{
          tabBarLabel: '案件',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="folder-open-outline"
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Clues"
        component={ClueBoardScreen}
        options={{
          tabBarLabel: '线索',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="search-outline"
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="person-outline"
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}