import BoltApi from "./bolt-api";

import { env } from "../config";

export const boltApi = new BoltApi(env.apiKey, env.publishableKey, env.baseURL)
