import { env } from "~/env";
import qs from "qs";
import axios from "axios";

const baseUrl = env.NEXT_PUBLIC_API_ENDPOINT_URL;

const client = axios.create({
  baseURL: `${baseUrl}/api/v3`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  paramsSerializer(params) {
    return qs.stringify(params, {
      encodeValuesOnly: true, // prettify URL
    });
  },
});

export { client };
