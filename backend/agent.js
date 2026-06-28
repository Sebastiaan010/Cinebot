import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AzureChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { getPopularMovies, getRecentMovies, searchMovie, getPopularSeries } from "./tools.js";
import { searchDocuments } from "./embeddings.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const model = new AzureChatOpenAI({ temperature: 0.7 });
const checkpointer = new MemorySaver();

const retrieveTool = tool(
    async ({ query }) => {
        console.log(`🔧 retrieveTool aangeroepen met query: ${query}`);
        const results = await searchDocuments(query, 3);
        // Log welke documenten gevonden zijn
        const sources = [...new Set(results.map(r => r.source))];
        console.log(`[retrieve] gezocht in documenten: ${sources.join(", ")}`);
        return results.map(r => `[bron: ${r.source}]\n${r.content}`).join("\n\n");
    },
    {
        name: "retrieve",
        description: "Zoek in kennisdocumenten over filmgenres, beroemde regisseurs en klassieke films.",
        schema: z.object({
            query: z.string().describe("De zoekterm, bijv. 'thriller genre kenmerken' of 'Stanley Kubrick'"),
        }),
    }
);

export const agent = createReactAgent({
    llm: model,
    tools: [getPopularMovies, getRecentMovies, searchMovie, getPopularSeries, retrieveTool],
    checkpointSaver: checkpointer,
    messageModifier: `Je bent CineBot — een enthousiaste filmkenner die mensen helpt om de perfecte film of serie te vinden.

Je doelgroep zijn mensen die niet weten wat ze vanavond willen kijken. Ze kunnen een stemming, genre, of acteur noemen en jij geeft gerichte aanbevelingen.

Je hebt toegang tot de volgende tools:
- getPopularMovies: goed beoordeelde populaire films, optioneel per genre
- getRecentMovies: recente films uit 2024 en 2025, optioneel per genre — gebruik dit als iemand vraagt naar iets nieuws of recents
- getPopularSeries: populaire series, optioneel per genre
- searchMovie: zoek een specifieke film op naam
- retrieve: zoek in kennisdocumenten over genres, regisseurs en klassiekers

Jouw stijl:
- Enthousiast en persoonlijk — je hebt zelf ook een mening over films
- Stel altijd een tegenvraag als je meer context nodig hebt
- Geef nooit meer dan 3-5 aanbevelingen tegelijk
- Vermeld altijd de beoordeling en het jaar van een film
- Praat Nederlands

Beperkingen:
- Alleen over films en series
- Geen spoilers tenzij de gebruiker er expliciet om vraagt`,
});
