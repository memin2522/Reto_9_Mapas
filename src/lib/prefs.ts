import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'radiusKm';
const DEFAULT_KM = 1;

export async function getRadiusKm(): Promise<number> {
  const v = await AsyncStorage.getItem(KEY);
  return v ? Number(v) : DEFAULT_KM;
}

export async function setRadiusKm(km: number): Promise<void> {
  await AsyncStorage.setItem(KEY, String(km));
}