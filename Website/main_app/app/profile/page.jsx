"use client";
import ReactMarkdown from "react-markdown"
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    const [active, setActive] = useState(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false)
    const [url, setUrl] = useState("");
    const [reply,setReply] = useState("");
    const [audio, setAudio] = useState(null);
    const [textAudio,setTextAudio] = useState(false);
    const [result, setResult] = useState(null); // <-- New state for backend response

    const handleAudio = async () => {
        if (!audio) {
            alert("Please select an audio file");
            return;
        }

        try {
            setTextAudio(true)
            const formData = new FormData();
            formData.append("file", audio);

            const response = await fetch("http://127.0.0.1:8001/api/voice-detection", {
                method: "POST",
                headers: {
                    "x-api-key": "test_key_123"
                },
                body: formData
            });

            const data = await response.json();
            console.log(data);
            setResult(data); // <-- Set response to display
        } catch (error) {
            console.error("Error uploading audio:", error);
        } finally {
            setTextAudio(false)
        }
    }

    const handelText = async () => {
        setLoading(true)
        try {
            const res = await fetch("http://127.0.0.1:8000/text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content: text })
            })

            const data = await res.json()
            setReply(data.reply)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    
    const handelSignOut = async () => {
        await fetch("/api/auth/token", {
            method:"POST"
        })
        window.location.href = "/"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-800 text-white flex flex-col items-center p-6">
            <div className="flex justify-end w-full">
                <Button className="bg-red-600 hover:bg-red-500" onClick={handelSignOut}>Signout</Button>
            </div>
            {/* Heading */}
            <h1 className="text-6xl font-bold my-8 mb-10">Analysis Dashboard</h1>
            <div className="border-2 w-2xl mb-10"></div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full max-w-5xl">

                {/* Text Analysis */}
                <div
                    onClick={() => setActive("text")}
                    className={`cursor-pointer p-6 rounded-xl shadow-lg transition transform hover:scale-105 ${active === "text" ? "bg-blue-600 border border-blue-950" : "bg-gray-800"}`}
                >
                    <h2 className="text-xl flex font-semibold mb-2">🕵🏻‍♂️ Phising Text Analysis</h2>
                    <p className="text-gray-300">Analyze written content easily</p>
                </div>

                {/* Audio Analysis */}
                <div
                    onClick={() => setActive("audio")}
                    className={`cursor-pointer p-6 rounded-xl shadow-lg transition transform hover:scale-105 ${active === "audio" ? "bg-green-600" : "bg-gray-800"}`}
                >
                    <h2 className="text-xl font-semibold mb-2">🎧 Ai/Phishing Voice Detector </h2>
                    <p className="text-gray-300">Upload and analyze audio files (.wav/mp3 format)</p>
                </div>

                {/* Website Analysis */}
                <div
                    onClick={() => setActive("website")}
                    className={`cursor-pointer p-6 rounded-xl shadow-lg transition transform hover:scale-105 ${active === "website" ? "bg-purple-600" : "bg-gray-800"}`}
                >
                    <h2 className="text-xl font-semibold mb-2">🌐 Phising Website Analysis</h2>
                    <p className="text-gray-300">Check URLs for insights</p>
                </div>
            </div>

            {/* Dynamic Input Section */}
            <div className="w-full max-w-6xl bg-gray-800 p-6 rounded-xl shadow-lg">

                {/* TEXT */}
                <>
                {active === "text" && (
                    <div className="flex flex-col gap-4">
                        <textarea
                            placeholder="Enter text to analyze..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={5}
                        />
                        <button onClick={handelText} className="bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition">
                            {loading ? <h1 className="animation animate-pulse">Analyzing...</h1> : "Analyze Text"}
                        </button>
                    </div>
                )}
                {reply !== "" && active == "text" && (
                        <div className="p-4 mt-4 bg-gray-700 rounded-lg border border-gray-600 max-w-none">
                            <ReactMarkdown
                                components={{
                                    h3: ({ children }) => (
                                        <h3 className="text-2xl font-bold mb-2 text-blue-300 border-b border-gray-500 pb-2">
                                            {children}
                                        </h3>
                                    ),
                                    h4: ({ children }) => (
                                        <h4 className="text-lg font-semibold mt-4 mb-1 text-red-400">
                                            {children}
                                        </h4>
                                    ),
                                    p: ({ children }) => (
                                        <p className="text-gray-300 leading-relaxed text-lg mb-3">
                                            {children}
                                        </p>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className="list-disc pl-5 space-y-1 mb-3">
                                            {children}
                                        </ul>
                                    ),
                                    li: ({ children }) => (
                                        <li className="text-gray-300 text-lg">
                                            {children}
                                        </li>
                                    ),
                                    strong: ({ children }) => (
                                        <span className="font-semibold text-[19px] text-white">
                                            {children}
                                        </span>
                                    ),
                                    hr: () => (
                                        <div className="border-t border-gray-500 my-4" />
                                    ),
                                }}
                            >
                                {reply}
                            </ReactMarkdown>
                        </div>
                )}
                </>
                

                {/* AUDIO */}
                {active === "audio" && (
                    <div className="flex flex-col gap-4">
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setAudio(e.target.files[0])}
                            className="p-2 bg-gray-700 rounded border border-gray-600"
                        />
                        <button onClick={handleAudio} className="bg-green-600 hover:bg-green-700 py-2 rounded font-semibold transition">
                            {textAudio ? <h1>Analysing the provided audio... </h1> : <h1>Analyze Audio </h1>}
                        </button>
                    </div>
                )}

                {/* WEBSITE */}
                {active === "website" && (
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Enter website URL..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button onClick={() => window.location.href = `http://localhost:5173?url=${encodeURIComponent(url)}`} className="bg-purple-600 hover:bg-purple-700 py-2 rounded font-semibold transition">
                            {textAudio ? <h1>Analysing the provided audio... </h1> : <h1>Analyze Audio </h1>}
                           
                        </button>
                        <a
                            href="https://www.dropbox.com/scl/fi/paltgx93qo7myj7t5ptw7/chrome-extension.zip?rlkey=vpc74kgn54yb1t04r1gz3jzit&st=v34sm90z&dl=1"
                            download
                            className="mt-2 flex justify-center hover:text-blue-500 hover:underline"
                        >
                            Download Chrome Extension
                        </a>
                        {/* <button className="mt-2 hover:text-blue-500 hover:underline"> <a href="https://www.dropbox.com/scl/fi/paltgx93qo7myj7t5ptw7/chrome-extension.zip?rlkey=vpc74kgn54yb1t04r1gz3jzit&st=v34sm90z&dl=0" download={}></a> Download Chrome Extension </button> */}
                    </div>
                )}

                {/* Default message */}
                {!active && (
                    <p className="text-center text-gray-400">
                        Select an option above to start analysis
                    </p>
                )}

                {/* RESULT BLOCK */}
                {result && active == "audio" && (
                    <div className="mt-6 p-6 bg-gray-800 rounded-2xl border border-gray-600 shadow-lg">

                        {/* Title */}
                        <h3 className="text-2xl font-bold mb-4 text-blue-400">
                            Analysis Result
                        </h3>

                        {/* Status + Classification */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-sm text-gray-400">Status</p>
                                <p className="text-white text-lg font-semibold capitalize">
                                    {result.status}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-sm text-gray-400">Classification</p>
                                <p className="px-3 py-1 rounded-full bg-purple-600/20 text-white text-md font-semibold">
                                    {result.classification || result.type || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Confidence Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                                <span>Confidence</span>
                                <span>{(result.confidenceScore * 100).toFixed(2)}%</span>
                            </div>

                            <div className="w-full bg-gray-600 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${result.confidenceScore * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="mt-4">
                            <p className="text-sm text-gray-400 mb-1">Explanation</p>
                            <p className="text-gray-200 leading-relaxed">
                                {result.explanation}
                            </p>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}