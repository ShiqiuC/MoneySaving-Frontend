import moment from "moment"

/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */
export interface EpisodeItem {
  title: string
  pubDate: string
  link: string
  guid: string
  author: string
  thumbnail: string
  description: string
  content: string
  enclosure: {
    link: string
    type: string
    length: number
    duration: number
    rating: { scheme: string; value: string }
  }
  categories: string[]
}

export interface ApiFeedResponse {
  status: string
  feed: {
    url: string
    title: string
    link: string
    author: string
    description: string
    image: string
  }
  items: EpisodeItem[]
}

export interface ApiSignupResponse {
  results: string
  message: string
}

export interface ApiPostRecordResponse {
  results: string
  message: string
}

export interface ApiPostCategoryResponse {
  results: string
  message: string
}

export interface ApiLoginResponse {
  results: string
  message: string
}

export interface ExpenseRecord {
  category: string
  amount: number
  emoji: string
  recordedAt: number | undefined
}

export interface ApiRecordResponse {
  results: ExpenseRecord[]
}

export interface ConvertedRecordResponse {
  results: {
    [date: string]: ExpenseRecord[]
  }
}

export function convertRecords(apiResponse: ApiRecordResponse): ConvertedRecordResponse {
  const convertedResults: { [date: string]: ExpenseRecord[] } = {};

  apiResponse.results.forEach(record => {
    // Convert the 'recordedAt' timestamp from seconds to a date string ('YYYY-MM-DD')
    const date = moment.unix((record.recordedAt ?? 0) / 1000).format("YYYY-MM-DD");

    // Initialize the date key in the object if it doesn't exist
    if (!convertedResults[date]) {
      convertedResults[date] = [];
    }

    // Push the current record to the correct date array
    convertedResults[date].push(record);
  });

  // Create an object sorted by date keys in descending order
  const sortedResults = Object.keys(convertedResults)
    .sort((a, b) => b.localeCompare(a))  // This sorts the dates in descending order
    .reduce((acc, date) => {
      acc[date] = convertedResults[date];
      return acc;
    }, {} as { [date: string]: ExpenseRecord[] });

  return { results: sortedResults };
}

export interface Category {
  id: number,
  name: string,
  emoji: string
}

export interface ApiCategoryResponse {
  results: Category[]
}

export interface ApiExpensesResponse {
  results: {
    totalExpenses: number
    totalExpensesRecords: number,
    topCategories: ExpenseRecord[]
  }
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}