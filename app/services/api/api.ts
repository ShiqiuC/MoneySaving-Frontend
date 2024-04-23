/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/Services.md)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiCategoryResponse, ApiConfig, ApiExpensesResponse, ApiFeedResponse, ApiLoginResponse, ApiPostCategoryResponse, ApiPostRecordResponse, ApiRecordResponse, ApiSignupResponse } from "./api.types"
import type { EpisodeSnapshotIn } from "../../models/Episode"
import * as FileSystem from 'expo-file-system';

async function fileToBase64(uri: string): Promise<string> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  const base64 = await FileSystem.readAsStringAsync(fileInfo.uri, { encoding: FileSystem.EncodingType.Base64 });
  console.log("Base64 String Length: ", base64.length);
  return base64;
}

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
      maxBodyLength: 1000000000000
    })
  }

  /**
   * Gets a list of recent React Native Radio episodes.
   */
  async getEpisodes(): Promise<{ kind: "ok"; episodes: EpisodeSnapshotIn[] } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
      `api.json?rss_url=https%3A%2F%2Ffeeds.simplecast.com%2FhEI_f9Dx`,
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      // This is where we transform the data into the shape we expect for our MST model.
      const episodes: EpisodeSnapshotIn[] =
        rawData?.items.map((raw) => ({
          ...raw,
        })) ?? []

      return { kind: "ok", episodes }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async signup(username: string, password: string): Promise<ApiSignupResponse | undefined> {
    const response: ApiResponse<ApiSignupResponse> = await this.apisauce.post(
      "/signup", {
        username: username,
        password: password,
      }
    )
    return response.data
  }

  async login(username: string, password: string): Promise<ApiLoginResponse | undefined> {
    const response: ApiResponse<ApiLoginResponse> = await this.apisauce.post(
      "/login", {
        username: username,
        password: password,
      }
    )
    return response.data
  }

  async getExpensesRecord(year: number, month: number, authToken: string): Promise<ApiRecordResponse | undefined> {
    const response: ApiResponse<ApiRecordResponse> = await this.apisauce.get(
      `/records?year=${year}&month=${month}`, {}, { headers: { 'Authorization':  `Basic ${authToken}`}}
    )
    return response.data
  }
  
  async getCategory(authToken: string): Promise<ApiCategoryResponse | undefined> {
    const response: ApiResponse<ApiCategoryResponse> = await this.apisauce.get(
      "/categories", {}, { headers: { 'Authorization':  `Basic ${authToken}`}}
    )
    return response.data
  }

  async getExpenses(year: number, month: number, authToken: string): Promise<ApiExpensesResponse | undefined> {
    const response: ApiResponse<ApiExpensesResponse> = await this.apisauce.get(
      `/expenses?year=${year}&month=${month}`, {}, { headers: { 'Authorization':  `Basic ${authToken}`}}
    )
    console.log(response.data)
    return response.data
  }

  async postRecord(authToken: string, amount: number, category: string, recordedAt: number): Promise<ApiPostRecordResponse | undefined> {
    const response: ApiResponse<ApiPostRecordResponse> = await this.apisauce.post(
      "/records", { category: category, amount: amount, recorded_at: recordedAt}, { headers: { 'Authorization':  `Basic ${authToken}`}}
    )
    return response.data
  }

  async postCategory(authToken: string, name: string, emoji: string): Promise<ApiPostCategoryResponse | undefined> {
    const response: ApiResponse<ApiPostCategoryResponse> = await this.apisauce.post(
      "/categories", { name: name, emoji: emoji}, { headers: { 'Authorization':  `Basic ${authToken}`}}
    )
    console.log(response)
    return response.data
  }

  async postRecordAudio(authToken: string, uri: string): Promise<ApiPostRecordResponse | undefined> {
    const response: ApiResponse<ApiPostRecordResponse> = await this.apisauce.post(
      "/audioRecords", { base64: await fileToBase64(uri)}, { headers: { 'Authorization':  `Basic ${authToken}`}}
    )
    return response.data
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
