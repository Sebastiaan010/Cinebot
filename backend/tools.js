import { tool } from "@langchain/core/tools";
import { z } from "zod";

const TMDB_BASE = "https://api.themoviedb.org/3";

async function tmdbFetch(endpoint) {
    const response = await fetch(`${TMDB_BASE}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            "Content-Type": "application/json",
        },
    });

    console.log(`[TMDB] status: ${response.status}`);

    if (!response.ok) {
        const err = await response.json();
        console.error(`[TMDB ERROR]`, err);
        throw new Error(`TMDB API fout: ${err.status_message}`);
    }

    return response.json();
}

// Tool 1: Populaire films (hoge rating, veel stemmen)
export const getPopularMovies = tool(
    async ({ genre_id }) => {
        console.log(`🔧 getPopularMovies aangeroepen met genre_id: ${genre_id ?? "geen"}`);
        const genreFilter = genre_id ? `&with_genres=${genre_id}` : "";
        const endpoint = `/discover/movie?sort_by=vote_average.desc&vote_count.gte=5000${genreFilter}&language=nl-NL`;

        const data = await tmdbFetch(endpoint);
        const movies = data.results.slice(0, 6).map(m => ({
            titel: m.title,
            jaar: m.release_date?.split("-")[0] ?? "onbekend",
            beoordeling: m.vote_average?.toFixed(1),
            beschrijving: m.overview,
        }));
        return JSON.stringify(movies);
    },
    {
        name: "getPopularMovies",
        description: "Haal goed beoordeelde populaire films op, optioneel gefilterd op genre. Gebruik voor vragen naar goede of populaire films. Gebruik genre_id: 28=actie, 35=komedie, 18=drama, 27=horror, 878=sciencefiction, 10749=romantiek, 53=thriller, 16=animatie, 99=documentaire.",
        schema: z.object({
            genre_id: z.number().nullable().optional().describe("Optioneel genre ID, of null als geen filter nodig is"),
        }),
    }
);

// Tool 2: Recente films (afgelopen jaar)
export const getRecentMovies = tool(
    async ({ genre_id }) => {
        console.log(`🔧 getRecentMovies aangeroepen met genre_id: ${genre_id ?? "geen"}`);
        const genreFilter = genre_id ? `&with_genres=${genre_id}` : "";
        const endpoint = `/discover/movie?sort_by=popularity.desc&primary_release_date.gte=2024-01-01${genreFilter}&language=nl-NL`;

        const data = await tmdbFetch(endpoint);
        const movies = data.results.slice(0, 6).map(m => ({
            titel: m.title,
            jaar: m.release_date?.split("-")[0] ?? "onbekend",
            beoordeling: m.vote_average?.toFixed(1),
            beschrijving: m.overview,
        }));
        return JSON.stringify(movies);
    },
    {
        name: "getRecentMovies",
        description: "Haal recente films op uit 2024 en 2025, optioneel gefilterd op genre. Gebruik dit als iemand vraagt naar nieuwe of recente films. Gebruik genre_id: 28=actie, 35=komedie, 18=drama, 27=horror, 878=sciencefiction, 10749=romantiek, 53=thriller, 16=animatie, 99=documentaire.",
        schema: z.object({
            genre_id: z.number().nullable().optional().describe("Optioneel genre ID, of null als geen filter nodig is"),
        }),
    }
);

// Tool 3: Zoek een specifieke film
export const searchMovie = tool(
    async ({ query }) => {
        console.log(`🔧 searchMovie aangeroepen met query: ${query}`);
        const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}&language=nl-NL`);
        const movies = data.results.slice(0, 5).map(m => ({
            titel: m.title,
            jaar: m.release_date?.split("-")[0] ?? "onbekend",
            beoordeling: m.vote_average?.toFixed(1),
            beschrijving: m.overview,
        }));
        return JSON.stringify(movies);
    },
    {
        name: "searchMovie",
        description: "Zoek een specifieke film op naam.",
        schema: z.object({
            query: z.string().describe("De naam van de film om op te zoeken"),
        }),
    }
);

// Tool 4: Populaire series
export const getPopularSeries = tool(
    async ({ genre_id }) => {
        console.log(`🔧 getPopularSeries aangeroepen met genre_id: ${genre_id ?? "geen"}`);
        const genreFilter = genre_id ? `&with_genres=${genre_id}` : "";
        const endpoint = `/discover/tv?sort_by=vote_average.desc&vote_count.gte=1000${genreFilter}&language=nl-NL`;

        const data = await tmdbFetch(endpoint);
        const series = data.results.slice(0, 6).map(s => ({
            titel: s.name,
            jaar: s.first_air_date?.split("-")[0] ?? "onbekend",
            beoordeling: s.vote_average?.toFixed(1),
            beschrijving: s.overview,
        }));
        return JSON.stringify(series);
    },
    {
        name: "getPopularSeries",
        description: "Haal populaire series op, optioneel gefilterd op genre.",
        schema: z.object({
            genre_id: z.number().nullable().optional().describe("Optioneel genre ID, of null als geen filter nodig is"),
        }),
    }
);
