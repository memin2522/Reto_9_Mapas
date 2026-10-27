export type Poi = {
  id: string;
  name: string;
  kind: 'hospital' | 'turismo';
  latitude: number;
  longitude: number;
};

export async function fetchPois(lat: number, lon: number, radiusKm: number): Promise<Poi[]> {
  const r = Math.round(radiusKm * 1000);
  const query = `
    [out:json][timeout:25];
    (
      nwr["amenity"="hospital"](around:${r},${lat},${lon});
      nwr["tourism"~"attraction|museum|viewpoint"](around:${r},${lat},${lon});
    );
    out center 100;`;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': '*/*',
    'User-Agent': 'Reto9-GPS/1.0 (curso apps moviles; sreyesgo@unal.edu.co)',
    'Referer': 'https://github.com/memin2522',
  },
  body: 'data=' + encodeURIComponent(query),
});
  if (!res.ok) throw new Error(`Overpass respondió ${res.status}`);
  const json = await res.json();

  return json.elements
    .filter((e: any) => e.tags?.name)             // el reto exige mostrar el nombre
    .map((e: any) => ({
      id: `${e.type}/${e.id}`,
      name: e.tags.name,
      kind: e.tags.amenity === 'hospital' ? 'hospital' : 'turismo',
      latitude: e.lat ?? e.center.lat,            // nodos: lat; vías/relaciones: center
      longitude: e.lon ?? e.center.lon,
    }));
}