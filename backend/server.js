import express from "express";
import cors from "cors";
import { agent } from "./agent.js";
import { ToolMessage } from "@langchain/core/messages";

// Vang alle unhandled rejections op zodat de server niet stopt
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

        const usedTools = result.messages
            .filter(m => m instanceof ToolMessage)
            .map(m => m.name);

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