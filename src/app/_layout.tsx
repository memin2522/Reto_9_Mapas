import { Link, Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Puntos cercanos',
          headerRight: () => (
            <Link href="/settings" asChild>
              <Pressable><Text style={{ fontSize: 16 }}>Radio</Text></Pressable>
            </Link>
          ),
        }}
      />
      <Stack.Screen name="settings" options={{ title: 'Preferencias' }} />
    </Stack>
  );
}