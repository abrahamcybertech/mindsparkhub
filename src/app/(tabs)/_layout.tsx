import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@/theme';
import { BookOpen, Home, Image as ImageIcon, Layers, Menu } from 'lucide-react-native';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="programmes"
        options={{
          title: 'Programmes',
          tabBarLabel: 'Programmes',
          tabBarIcon: ({ color, size }) => <Layers size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Impact',
          tabBarLabel: 'Impact',
          tabBarIcon: ({ color, size }) => <ImageIcon size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color, size }) => <BookOpen size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => <Menu size={size ?? 22} color={color} />,
        }}
      />
    </Tabs>
  );
}
