import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

// ─── Get walking directions from A to B ─────────────────────────────────────
export const getDirections = async (from, to) => {
  const url = "https://maps.googleapis.com/maps/api/directions/json";
  
  const { data } = await axios.get(url, {
    params: {
      origin: `${from.lat},${from.lng}`,
      destination: `${to.lat},${to.lng}`,
      mode: "walking",
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
    timeout: 10000,
  });

  if (data.status !== "OK") {
    throw new ApiError(400, `Routing failed: ${data.status}`);
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    steps: leg.steps.map((step) => ({
      instruction: step.html_instructions.replace(/<[^>]*>/g, ""),
      distance: step.distance.text,
      duration: step.duration.text,
    })),
    polyline: route.overview_polyline.points,
    totalDistance: leg.distance.text,
    totalDuration: leg.duration.text,
  };
};