import { X, Shield, AlertTriangle, CheckCircle2, Globe2Icon } from "lucide-react";
// import { botAnalysis } from "../lib/bot";
// import { useEffect } from "react";

export default function AnalysisReport({ isOpen, onClose, data }) {
    if (!isOpen) return null;
    // const [aboutWebsite, setAboutWebsite] = useState("Loading analysis...");

    // useEffect(async ()=>{
    //     const response = await fetch("http://127.0.0.1:8000/chat", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ scanResult })
    //     });

    //     const data = await response.json();
    //     return data.text;
    // })
    
    const result = data?.result || {};

    const contentRisk = Math.round((result?.content?.risk ?? 0) * 100);
    const redirectScore = result?.redirects?.score ?? 0;
    const networkScore = result?.network?.score ?? 0;
    const cookieScore = result?.cookies?.score ?? 0;

    const getRiskLevel = (val) => {
        if (val >= 90) return { text: "Critical", color: "text-red-500" };
        if (val >= 75) return { text: "High", color: "text-yellow-500" };
        if (val >= 45) return { text: "Moderate", color: "text-blue-500" };
        return { text: "Low", color: "text-green-500" };
    };

    const overall = Math.max(contentRisk, redirectScore, networkScore, cookieScore);
    const risk = getRiskLevel(overall);

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
            {/* Modal */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <div className="flex items-center gap-3">
                        <Shield className="w-9 h-9 text-blue-500 text-center" />
                        <h2 className="text-4xl font-bold">Website Analysis Report</h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-red-500 bg-red-100 hover:bg-red-300"
                    >
                        <X size={30}/>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Overall */}
                    <div className="bg-gray-50 rounded-xl p-5 flex flex-col justify-between ">
                        <div className="flex justify-between">
                            <p className="text-2xl flex gap-2 font-bold text-black"><Globe2Icon className="h-8 w-8"/> About Website</p>
                            {overall >= 0 ? (
                            <AlertTriangle className="text-yellow-500 w-10 h-10 pb-2 animate-pulse" />
                        ) : (
                            <CheckCircle2 className="text-green-500 w-8 h-8 " />
                        )}
                        </div>
                        <div className="border-2">
                            shbasifhv
                        </div>

                        
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card title="Content" value={contentRisk} />
                        <Card title="Redirects" value={redirectScore} />
                        <Card title="Network" value={networkScore} />
                        <Card title="Cookies" value={cookieScore} />
                    </div>

                    {/* Details */}
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="font-semibold mb-3">Findings</h3>

                        <ul className="text-sm text-gray-600 space-y-2">
                            {result?.content?.reason?.map((r, i) => (
                                <li key={i}>• {r}</li>
                            ))}

                            {(result?.cookies?.length ?? 0) > 0 && (
                                <li>• Suspicious cookie activity detected</li>
                            )}

                            {(result?.redirects?.redirect_chain?.length ?? 0) > 0 && (
                                <li>• Redirect chain present</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Small reusable card
function Card({ title, value }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    );
}