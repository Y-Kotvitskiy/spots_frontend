// Простий кеш в пам'яті (можна покращити до localStorage)
const addressCache = new Map<string, string>();

export const getAddressFromCoords = async (
  lat: number,
  lng: number,
): Promise<string> => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

  // TODO прибрати заглушку на продакшені

  //  return "Це тестова адреса! " + new Date().toISOString();

  if (addressCache.has(key)) {
    return addressCache.get(key)!;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_PLACE_KEY as string;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results?.[0]) {
      return data.results[0].formatted_address;
    }
    return "";
  } catch (e) {
    console.error("Geocoding error:", e);
    return "";
  }
};
