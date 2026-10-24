// Простий кеш в пам'яті (можна покращити до localStorage)
const addressCache = new Map<string, string>();

export const getAddressFromCoords = async (
  lat: number,
  lng: number,
): Promise<string> => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

  // TODO прибрати заглушку на продакшені

  return "Це тестова адреса!";

  if (addressCache.has(key)) {
    return addressCache.get(key)!;
  }

  if (!window.google?.maps?.Geocoder) return "";

  try {
    const geocoder = new google.maps.Geocoder();
    const { results } = await geocoder.geocode({ location: { lat, lng } });

    const address = results[0]?.formatted_address || "";
    if (address) {
      addressCache.set(key, address);
    }
    return address;
  } catch (e) {
    console.error("Geocoding error:", e);
    return "";
  }
};
