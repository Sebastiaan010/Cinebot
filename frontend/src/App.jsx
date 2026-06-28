import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const TOOL_LABELS = {
    getPopularMovies: "🎬 Populaire films ophalen",
    getRecentMovies: "🆕 Recente films ophalen",
    getPopularSeries: "📺 Populaire series ophalen",
    searchMovie: "🔍 Film zoeken",
    retrieve: "📖 Kennisdocumenten raadplegen",
};

function generateUserId() {
    return `cinebot-${crypto.randomUUID()}`;
}

export default function App() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hey! Ik ben CineBot 🎬 Vertel me wat je vanavond wil kijken — een genre, stemming, of gewoon 'ik weet het niet' — en ik help je de perfecte film of serie vinden.",
            usedTools: [],
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [userid] = useState(generateUserId);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendMessage() {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        setMessages((prev) => [...prev, { role: "user", content: trimmed, usedTools: [] }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed, userid }),
            });

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.message,
                    usedTools: data.usedTools ?? [],
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Er ging iets mis. Probeer het opnieuw.", usedTools: [] },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function resetChat() {
        // Pagina herladen geeft een nieuwe userid en lege chat
        window.location.reload();
    }

    return (
        <div className="app">
            <header className="header">
                <div className="header-left">
                    <div className="avatar">🎬</div>
                    <div>
                        <h1>CineBot</h1>
                        <p>Jouw persoonlijke filmadviseur</p>
                    </div>
                </div>
                <div className="header-right">
                    <button className="reset-btn" onClick={resetChat}>
                        Nieuw gesprek
                    </button>
                </div>
            </header>

            <main className="chat-window">
                {messages.map((msg, i) => (
                    <div key={i} className={`bubble-wrapper ${msg.role}`}>
                        <div className={`bubble ${msg.role}`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            {msg.usedTools && msg.usedTools.length > 0 && (
                                <div className="tool-badges">
                                    {msg.usedTools.map((t) => (
                                        <span key={t} className="tool-badge">
                                            🔧 {TOOL_LABELS[t] ?? t}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="bubble-wrapper assistant">
                        <div className="bubble assistant loading">
                            <span className="dot" /><span className="dot" /><span className="dot" />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </main>

            <footer className="input-area">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Wat wil je vanavond kijken?"
                    rows={2}
                    disabled={loading}
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()}>
                    {loading ? "..." : "Stuur"}
                </button>
            </footer>
        </div>
    );
}
