/* global chrome */
import React, { useState, useEffect } from 'react';

export default function LoadingPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [scanResult, setScanResult] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: "https://www.youtube.com"
            })
        })
            .then(response => response.json())
            .then(data => {
                setScanResult(data);
                setIsLoading(false);
                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error);
                setScanResult({ error: 'Failed to scan URL' });
                setIsLoading(false);
            });
    }, ["https://www.youtube.com"]);

    function goToWebsite() {
        if (window.chrome && chrome.runtime) {
            return chrome.runtime.sendMessage({
                action: "bypassOnce",
                targetUrl: "https://www.youtube.com"
            });
        }
        return window.location.href = "https://www.youtube.com";
    }

    // Loading Screen
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                <div className="text-center">

                    {/* Animated Shield Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                            <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-full flex items-center justify-center">
                                <h1 className="text-white text-xl font-bold m-0">Scanning the url</h1>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Loading...
                    </h1>

                    {/* Animated Dots */}
                    <div className="flex justify-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    // Results Screen
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-[700px]">

                {/* Results Card */}
                <div className="bg-white/10 backdrop-blur-[10px] rounded-2xl p-8 shadow-2xl border border-white/20">
                    <h1 className="text-4xl font-bold text-white text-center mb-2">Scan Complete!</h1>

                    {/* Display your scan results here */}
                    <div className="mb-4">
                        <h2 className="text-4xl font-bold text-white text-center mb-2">Results</h2>
                    </div>

                    {/* Content Analysis Section */}
                    {scanResult.content && (
                        <div className="bg-black/30 rounded-lg p-5 mb-4">
                            <div className="text-blue-400 text-lg font-bold mb-3 border-b-2 border-blue-400/30 pb-2">
                                🔍 Content Analysis
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-slate-400 text-sm">Category:</span>
                                <span className="text-white text-sm font-semibold text-right max-w-[60%] break-words">
                                    {scanResult.content.category.map((cat, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-block bg-emerald-500 text-white px-3 py-1 rounded-full text-xs mr-2 mb-2"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </span>
                            </div>
                            {scanResult.content.reason && scanResult.content.reason.length > 0 && (
                                <div className="mt-3">
                                    <span className="text-slate-400 text-sm">Reasons:</span>
                                    {scanResult.content.reason.map((reason, idx) => (
                                        <div
                                            key={idx}
                                            className="text-slate-200 text-sm p-2 bg-white/5 rounded mb-2"
                                        >
                                            • {reason}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Redirects Section */}
                    {scanResult.redirects && (
                        <div className="bg-black/30 rounded-lg p-5 mb-4">
                            <div className="text-blue-400 text-lg font-bold mb-3 border-b-2 border-blue-400/30 pb-2">
                                🔄 Thrid Party Content :
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-slate-400 text-sm">Cross-Domain:</span>
                                <span className="text-white text-sm font-semibold text-right max-w-[60%] break-words">
                                    {scanResult.redirects.cross_domain_content ? 'Yes ⚠️' : 'No ✓'}
                                </span>
                            </div>
                            {scanResult.redirects.cross_domain_content && (
                                <div className="mt-3">
                                    <span className="text-slate-400 text-sm">
                                        It includes content from these domains:
                                    </span>
                                    <div className="mt-2">
                                        {scanResult.redirects.cross_domain_list.map((ele, index) => (
                                            <div
                                                key={index}
                                                className="text-slate-200 text-sm p-2 bg-white/5 rounded mb-2"
                                            >
                                                {ele}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="mt-2">
                                <span className="text-slate-400 text-sm">Info:</span>
                                <div className="text-slate-200 text-sm p-2 bg-white/5 rounded mb-2">
                                    {scanResult.redirects.redirect_len}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Network Analysis Section */}
                    {scanResult.network && (
                        <div className="bg-black/30 rounded-lg p-5 mb-4">
                            <div className="text-blue-400 text-lg font-bold mb-3 border-b-2 border-blue-400/30 pb-2">
                                🌐 Network Analysis
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-slate-400 text-sm">POST Requests:</span>
                                <span className="text-white text-sm font-semibold text-right max-w-[60%] break-words">
                                    {scanResult.network.post_requests}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-slate-400 text-sm">External Requests:</span>
                                <span className="text-white text-sm font-semibold text-right max-w-[60%] break-words">
                                    {scanResult.network.external_requests.length}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-slate-400 text-sm">IP Requests:</span>
                                <span className="text-white text-sm font-semibold text-right max-w-[60%] break-words">
                                    {scanResult.network.ip_requests.length}
                                </span>
                            </div>
                            <div className="mt-2">
                                <span className="text-slate-400 text-sm">Info:</span>
                                <div className="text-slate-200 text-sm p-2 bg-white/5 rounded mb-2">
                                    {scanResult.network.ip_requests.length > 0 &&
                                        <span>Website trying to communicate with might be malicious network</span>}
                                    {scanResult.network.ip_requests.length == 0 && scanResult.network.external_requests.length >= 10 &&
                                        <span>Website contains high External Request</span>}
                                    {scanResult.network.ip_requests.length == 0 && scanResult.network.external_requests.length == 0 &&
                                        <span>No Suspicious Network Activity Spotted</span>}
                                    {scanResult.network.ip_requests.length == 0 && scanResult.network.external_requests.length < 10 && scanResult.network.external_requests.length != 0 &&
                                        <span>Website sends request to other Domains</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cookies Section */}
                    {scanResult.cookies && (
                        <div className="bg-black/30 rounded-lg p-5 mb-4">
                            <div className="text-blue-400 text-lg font-bold mb-3 border-b-2 border-blue-400/30 pb-2">
                                🍪 Cookie Security
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-slate-400 text-sm">Cookie Stealing Detected:</span>
                                <span className="text-white text-sm font-semibold text-right max-w-[60%] break-words">
                                    {scanResult.cookies.Cookie_Stealing.length > 0 ?
                                        `${scanResult.cookies.Cookie_Stealing.length} ⚠️` : 'None ✓'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-white text-sm font-semibold text-right max-w-[60%] break-words">
                                    Send to URL
                                </span>
                                <span className="text-white text-sm font-semibold text-right max-w-[60%] break-words">
                                    Data Send
                                </span>
                            </div>
                            {scanResult.cookies.Cookie_Stealing.map((ele, index) => (
                                <div key={index} className="flex justify-between py-2 border-b border-white/10">
                                    <span className="text-white text-sm font-semibold text-left max-w-[60%] break-words p-5">
                                        {ele.url}
                                    </span>
                                    <span className="text-white text-sm font-semibold text-left max-w-[60%] break-words p-5">
                                        {ele.cookie_data}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center mt-6">
                        <button
                            className="bg-blue-500 text-white px-8 py-3 rounded-lg border-none text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-blue-600"
                            onClick={goToWebsite}
                        >
                            Continue to Website
                        </button>
                    </div>
                    <div className="flex gap-4 justify-center mt-6">
                        <button
                            className="bg-blue-500 text-white px-8 py-3 rounded-lg border-none text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-blue-600"
                            onClick={() => window.history.back()}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}