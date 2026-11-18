import axios from "axios";

export const searchPlaces = async (query) => {
  const url = "https://nominatim.openstreetmap.org/search";
  const { data } = await axios.get(url, {
    params: {
      q: `${query}, Ile-Ife, Nigeria`,
      format: "json",
      limit: 5,
      addressdetails: 1,
    },
    headers: {
      "User-Agent": "CampusOAU/1.0 (contact@campusoau.ng)",
    },
    timeout: 8000,
  });

  return data.map((place) => ({
    displayName: place.display_name,
    latitude: parseFloat(place.lat),
    longitude: parseFloat(place.lon),
  }));
};