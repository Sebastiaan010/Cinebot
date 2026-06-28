import express from "express";
import cors from "cors";
import { agent } from "./agent.js";
import { ToolMessage } from "@langchain/core/messages";

process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
});

process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err);
});

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
    const { message, userid } = req.body;

    if (!message || !userid) {
        return res.status(400).json({ error: "Geen bericht of userid meegestuurd." });
    }

    console.log(`[user ${userid}] ${message}`);

    try {
        const result = await agent.invoke(
            { messages: [{ role: "user", content: message }] },
            { configurable: { thread_id: userid } }
        );

        const answer = result.messages.at(-1).content;

        // Check welke tools zijn aangeroepen
        const toolMessages = result.messages.filter(m => m instanceof ToolMessage);
        const usedTools = toolMessages.map(m => m.name);

        // Log per tool ook het brondocument als het de retrieve tool is
        for (const toolMsg of toolMessages) {
            console.log(`[tool] ${toolMsg.name} aangeroepen`);
            if (toolMsg.name === "retrieve") {
                // De content bevat de tekst uit de vectorstore
                // We loggen de eerste 200 tekens zodat je ziet waar het vandaan komt
                const preview = toolMsg.content?.slice(0, 200) ?? "";
                console.log(`[retrieve] gevonden tekst: "${preview}..."`);
            }
        }

        console.log(`[tools gebruikt] ${usedTools.join(", ") || "geen"}`);

        res.json({
            message: answer,
            usedTools: [...new Set(usedTools)],
        });
    } catch (err) {
        console.error("[ERROR]", err.message);
        console.error(err.stack);
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/reset", (req, res) => {
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log("CineBot backend draait op http://localhost:3000");
});
