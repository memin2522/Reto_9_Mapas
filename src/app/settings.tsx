import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { getRadiusKm, setRadiusKm } from '../lib/prefs';

export default function Settings() {
  const [value, setValue] = useState('');

  useEffect(() => { getRadiusKm().then(r => setValue(String(r))); }, []);

  const save = async () => {
    const n = Number(value.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0 || n > 10) {
      Alert.alert('Radio inválido', 'Ingresa un valor entre 0.1 y 10 km');
      return;
    }
    await setRadiusKm(n);
    router.back();
  };

  return (
    <View style={styles.box}>
      <Text>Radio de búsqueda (km)</Text>
      <TextInput style={styles.input} value={value} onChangeText={setValue}
                 keyboardType="decimal-pad" />
      <Button title="Guardar" onPress={save} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 24, gap: 12 },
  input: { borderWidth: 1, borderColor: '#999', borderRadius: 6, padding: 10, fontSize: 16 },
});