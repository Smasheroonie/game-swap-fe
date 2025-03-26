import axios, { AxiosResponse } from "axios";

const rawgAPIKey = import.meta.env.VITE_RAWG_API_KEY;

const rawgAPI = axios.create({
  baseURL: "https://api.rawg.io/api",
});

export type Game = {
  name: string;
  slug: string;
  background_image: string;
  platforms: [{ platform: { id: number; name: string } }];
  stores: [{ store: { id: number; name: string } }];
  released: string;
  playtime: number;
  id: number;
  genres: [{ id: number; name: string; slug: string }];
  description_raw?: string;
  rating?: number;
  developers?: [{ id: number; name: string }];
};

type ApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Game[];
};

const fetchGames = async (
  url: string,
  platforms?: string | null
): Promise<Game[]> => {
  const response: AxiosResponse<ApiResponse> = await rawgAPI.get(url, {
    params: { platforms },
  });
  return response.data.results;
};

export const getUpcomingGames = async (
  platforms?: string | null
): Promise<Game[]> => {
  return fetchGames(
    `/games?key=${rawgAPIKey}&dates=2025-03-26,2025-06-26&ordering=-added`,
    platforms
  );
};

export const getPopularGames = async (
  platforms?: string | null
): Promise<Game[]> => {
  return fetchGames(`/games?key=${rawgAPIKey}&ordering=-added`, platforms);
};

export const getAllGames = async (): Promise<Game[]> => {
  return fetchGames(`/games?key=${rawgAPIKey}`);
};

export const fetchGameDetails = async (
  gameSlug: string | undefined
): Promise<Game> => {
  try {
    const response: AxiosResponse<Game> = await rawgAPI.get(
      `/games/${gameSlug}?key=${rawgAPIKey}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching game details:", error);
    throw new Error(`Unable to fetch details for game: ${gameSlug}`);
  }
};

export const getGamesByGenre = async (
  genres: any[] | null | undefined, // Accepts an array of genres
  platforms: any[] | null | undefined, // Accepts an array of platforms
  page?: number, // Optional page parameter
  pageSize?: number // Optional page size parameter
): Promise<Game[]> => {
  
  // Initialize the query strings for genres and platforms
  let genreQuery = "";
  let platformQuery = "";
  let paginationQuery = "";

  if (genres && genres.length > 0 && genres[0] !== null && genres[0] !== "") {
    genreQuery = `&genres=${genres.join(",").toLocaleLowerCase()}`;
  }

  if (platforms && platforms.length > 0 && platforms[0] !== null && platforms[0] !== "") {
    platformQuery = `&platforms=${platforms.join(",").toLocaleLowerCase()}`;
  }

  if (page) {
    paginationQuery += `&page=${page}`;
  }

  if (pageSize) {
    paginationQuery += `&page_size=${pageSize}`;
  }

  const queryString = `${genreQuery}${platformQuery}${paginationQuery}`;
  
  // Make the fetch call with the combined query string added to the URL
  return fetchGames(`/games?key=${rawgAPIKey}${queryString}`);
};

export const getGamesBySearch = async (searchTerm: string): Promise<Game[]> => {
  return fetchGames(`/games?key=${rawgAPIKey}&search=${searchTerm}`);
};

// New function to fetch genres
export const getPlatforms = async (): Promise<{
  id: number;
  name: string;
  slug: string;
}> => {
  try {
    const response = await rawgAPI.get(`/platforms?key=${rawgAPIKey}`);
    return response.data.results;
  } catch (error) {
    throw new Error("Error finding platforms");
  }
};

// New function to fetch platforms
export const getGenres = async (): Promise<{
  id: number;
  name?: string;
  slug: string;
}> => {
  try {
    const response = await rawgAPI.get(`/genres?key=${rawgAPIKey}`);
    return response.data.results;
  } catch (error) {
    throw new Error("Error finding genres");
  }
};

// Function for pagination
export const getPaginatedGames = async (
  page: number,
  itemsPerPage: number
): Promise<ApiResponse> => {
  const offset = (page - 1) * itemsPerPage;
  const response: AxiosResponse<ApiResponse> = await rawgAPI.get(
    `/games?key=${rawgAPIKey}&offset=${offset}&limit=${itemsPerPage}`
  );
  return response.data;
};

export const getGameScreenshots = async (gameId: number): Promise<[]> => {
  try {
    const response = await fetch(
      `https://api.rawg.io/api/games/${gameId}/screenshots?key=${rawgAPIKey}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch screenshots: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(error);
    return [];
  }
};

