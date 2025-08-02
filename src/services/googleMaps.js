import fs from "fs";
import { PlacesClient } from "@googlemaps/places";
import { Client as MapsClient } from "@googlemaps/google-maps-services-js";
import "dotenv/config";

// The Google Places API requires either Application Default Credentials
// or a service account key file (which is what we're using)
const GOOGLE_PLACES_API_KEYFILE =
  process.env.GOOGLE_PLACES_API_KEYFILE || "./keyfiles/google-places.json";
const placesClient = new PlacesClient({
  credentials: JSON.parse(fs.readFileSync(GOOGLE_PLACES_API_KEYFILE, "utf8")),
});
// The Google Maps API requires an API key to be provided separately (in the API calls)
const mapsClient = new MapsClient();

/**
 * Retrieve autocomplete suggestions for community centers in Singapore.
 * @param {string} input
 * @returns {Promise<{name: string, placeId: string}[]>}
 */
export async function autocompleteCCs(input) {
  // Retrieve only the main name of the autocompleted place
  const headers = {
    "X-Goog-FieldMask":
      "suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.placeId",
  };

  // Call the Places autocomplete API
  const response = await placesClient.autocompletePlaces(
    {
      input,
      includedPrimaryTypes: ["community_center"],
      includedRegionCodes: ["sg"],
    },
    { otherArgs: { headers } }
  );

  // @ts-ignore: The TypeScript linter can't infer that this removes undefined/null names/placeIds
  return (
    response[0].suggestions
      ?.map((sug) => ({
        name: sug.placePrediction?.structuredFormat?.mainText?.text,
        placeId: sug.placePrediction?.placeId,
      }))
      .filter((sug) => sug.name && sug.placeId) ?? []
  );
}

/**
 * Retrieve the zip code from a Google Maps place ID.
 * @param {string} placeId
 * @return {Promise<string | null>}
 */
export async function getZipCodeFromPlaceId(placeId) {
  // Retrieve only the main name of the autocompleted place
  const headers = {
    "X-Goog-FieldMask": "postalAddress.postalCode",
  };

  const response = await placesClient.getPlace(
    { name: `places/${placeId}` },
    { otherArgs: { headers } }
  );

  return response[0].postalAddress?.postalCode ?? null;
}

/**
 * Retrieve the latitude and longitude of a place from its Google Maps place ID.
 * @param {string} placeId
 * @returns {Promise<{lat: number, lon: number}>}
 */
export async function getCoordinatesFromPlaceId(placeId) {
  const response = await mapsClient.geocode({
    params: {
      place_id: placeId,
      key: process.env.GOOGLE_MAPS_API_KEY ?? "",
    },
  });
  return {
    lat: response.data.results[0].geometry.location.lat,
    lon: response.data.results[0].geometry.location.lng,
  };
}

/**
 * Retrieve the latitude and longitude of a place from its postal code.
 * @param {string} postalCode
 * @returns {Promise<{lat: number, lon: number}>}
 */
export async function getCoordinatesFromPostalCode(postalCode) {
  const response = await mapsClient.geocode({
    params: {
      components: {
        country: "SG",
        postal_code: postalCode,
      },
      key: process.env.GOOGLE_MAPS_API_KEY ?? "",
    },
  });
  return {
    lat: response.data.results[0].geometry.location.lat,
    lon: response.data.results[0].geometry.location.lng,
  };
}
