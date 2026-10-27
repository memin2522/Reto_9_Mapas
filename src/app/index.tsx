import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { getRadiusKm } from '../lib/prefs';
import { fetchPois, Poi } from '../lib/overpass';

type Coords = { latitude: number; longitude: number };

export default function MapScreen() {
  const [here, setHere] = useState<Coords | null>(null);
  const [radiusKm, setRadius] = useState(1);
  const [pois, setPois] = useState<Poi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') throw new Error('Permiso de ubicación denegado');

          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          const r = await getRadiusKm();
          const found = await fetchPois(coords.latitude, coords.longitude, r);

          if (!cancelled) { setHere(coords); setRadius(r); setPois(found); }
        } catch (e: any) {
          if (!cancelled) setError(e.message);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };   // evita setState si sales de la pantalla a mitad de carga
    }, [])
  );

  if (error) return <View style={styles.center}><Text>{error}</Text></View>;
  if (!here) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  const delta = (radiusKm / 111) * 2.5;      // ~111 km por grado de latitud

  return (
    <View style={{ flex: 1 }}>
      <MapView
        key={radiusKm}
        style={{ flex: 1 }}
        showsUserLocation
        initialRegion={{ ...here, latitudeDelta: delta, longitudeDelta: delta }}
      >
        <Circle center={here} radius={radiusKm * 1000}
                strokeColor="rgba(30,100,200,0.6)" fillColor="rgba(30,100,200,0.1)" />
        {pois.map(p => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.name}
            description={p.kind === 'hospital' ? 'Hospital' : 'Sitio turístico'}
            pinColor={p.kind === 'hospital' ? 'red' : 'blue'}
          />
        ))}
      </MapView>
      <View style={styles.badge}>
        <Text>{loading ? 'Buscando…' : `${pois.length} lugares en ${radiusKm} km`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  badge: { position: 'absolute', bottom: 24, alignSelf: 'center',
           backgroundColor: 'white', padding: 10, borderRadius: 8, elevation: 3 },
});