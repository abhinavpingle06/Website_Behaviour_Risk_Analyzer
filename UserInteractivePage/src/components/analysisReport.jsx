import { X, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AnalysisReport({ isOpen, onClose, data }) {
    if (!isOpen) return null;

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
                        <Shield className="w-6 h-6 text-blue-500" />
                        <h2 className="text-xl font-bold">Full Security Analysis</h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Overall */}
                    <div className="bg-gray-50 rounded-xl p-5 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Overall Risk</p>
                            <p className={`text-2xl font-bold ${risk.color}`}>
                                {risk.text}
                            </p>
                        </div>

                        {overall >= 75 ? (
                            <AlertTriangle className="text-red-500 w-8 h-8" />
                        ) : (
                            <CheckCircle2 className="text-green-500 w-8 h-8" />
                        )}
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