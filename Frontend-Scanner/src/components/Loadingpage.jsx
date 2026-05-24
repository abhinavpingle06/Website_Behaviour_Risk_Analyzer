import React, { useState, useEffect } from 'react';
import ProgressCircle from "./Reusables/radial_progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ReportModal from './Report';
import { ArrowUpRight, LeafIcon, LeafyGreen, Lectern, LucideLeaf, MessageCircleWarning } from "lucide-react"

export default function LoadingPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [scanResult, setScanResult] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const targetUrl = params.get('url') || 'https://example.com';

        fetch('YOUR_BACKEND_API_URL/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: targetUrl })
        })
            .then(response => response.json())
            .then(data => {
                setScanResult(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setScanResult({ error: 'Failed to scan URL' });
                setIsLoading(false);
            });
    }, [])
    function ContentInfo() { }
    
    let message = "";
    let valuefake = 90;

    if (valuefake >= 90) {
        message = "Cautious we found severe malicious activity ";
    } else if (valuefake >= 75) {
        message = "Cautious we found high risk activity ⚠️";
    } else if (valuefake >= 45) {
        message = "Cautious we found some malicious activity ⚠️";
    } else {
        message = "All clear, no major issues found ✅";
    }
    
    function ColorDecider(value) {
        let color;
        if (value >= 90) {
            return "#ff0000"
        }
        else if (value >= 75) {
            return "#ff0000"
        }
        else if (value >= 45) {
            return "#baaa1c"
        }
        else return "#3e98c7"
    }
    const color = ColorDecider(valuefake);

    //View Report Effect 

    // Loading Screen
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                <div className="text-center">
                    {/* Animated Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                            <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-full flex items-center justify-center">
                                <h1 className="text-white text-xl font-bold m-0">Scanning the url</h1>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white mb-4">Loading...</h1>

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

    
    // Results Screen - Dashboard
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
            <div className="">

                {/* Dashboard Header */}
                <div className="text-center mb-8 mt-4">
                    <h1 className="text-5xl font-bold text-white mb-2">Security Analysis Dashboard</h1>
                    <p className="text-lg text-slate-400">Comprehensive URL Security Report</p>
                </div>
                <div className='border border-2 border-white mx-[20vh] mb-10'></div>

                {/* Risk Overview Card */}
                <div className='flex flex-row'>
                    <div className="bg-[#204580]/60 rounded-2xl pt-6 border border-white/50 flex flex-col items-center max-w-[40%] ">
                        <h1 className="text-5xl font-bold text-slate-300 mb-9">Analysis Score</h1>
                        <div className='flex flex-col items-center'>
                        <ProgressCircle WnH={"w-50 h-50"} value={valuefake}/>
                        <div className="mt-6 px-6">
                            <h1 className="text-[1.90rem] font-mono font-[1000] text-center pb-4" style={{color:color}}>{message}</h1>
                            <p className="pt-2 text-base text-slate-300 leading-relaxed mb-4 px-2 ">
                                 {valuefake<45
                                      ? 'Our analysis found no significant security threats. This website appears to be legitimate and safe to visit.'
                                      : valuefake>=90
                                            ? 'Our analysis detected potential security threats. We recommend avoiding this website.\nRadu nako bevdya, tula ninty paazta. Radu nako bevdya, tula ninty paazta. Ninty paazt sobat chakna gheun yet, ninty paazt sobat chakna gheun yet'
                                         : 'Some minor concerns were detected. Review the details below before proceeding.'
                                 }
                            </p>
                               <div className="flex flex-col items-center gap-2 my-6">
                                 {/* WILL ADD SHADCN BUTTONSS TOMORROW */}
                                    <Button variant={"ghost"} className="text-2xl w-fit h-fit font-medium text-center items-centerfont-medium border-2 rounded-xl text-[#4d9dfe] hover:text-[#4d9dfe] hover:bg-white flex items-center">Continue to Website <ArrowUpRight/></Button>
                                    <div className='flex flex-row justify-center gap-5 mt-2'>
                                        <Button variant={"destructive"} className="text-2xl w-fit h-fit font-medium "> Report The Website <MessageCircleWarning className="w-10 h-10" /></Button>
                                        <Button variant={"ghost"} className="text-2xl w-fit h-fit font-medium text-center items-centerfont-medium border-2 rounded-xl text-[#4d9dfe] hover:text-[#4d9dfe]"> Back </Button>
                                    </div>
                                </div>
                        </div>
                        
                    </div>
                </div>
                

                {/* Key Findings Grid */}
                <div className="grid grid-cols-2 max-w-[60%] ml-5 gap-4 ">

                    {/* Content Security Finding */}
                    <div className="bg-white/[0.08] backdrop-blur-[10px] rounded-xl p-6 border border-white/[0.15] ease-in-out duration-400 float-animation hover:shadow-[0px_0px_40px_rgba(59,130,246,0.5)] ">
                        <h3 className="text-2xl text-[#4d9dfe] mb-5 font-bold">Webpage Content Analysis</h3>
                        <div className='flex mb-4 mx-5'> 
                            <div className='shrink-0'>
                                <ProgressCircle WnH={"w-25 h-25"} value={50} /> 
                            </div>
                            <p className='ml-4 flex flex-wrap gap-2 items-center text-white p-2'>
                                <Badge variant={"secondary"} className="text-sm"> Theft of Identity</Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Stupid </Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Fake Win </Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Theft </Badge>
                            </p>
                        </div>
                        <div className="text-2xl text-white font-bold mb-2">
                            {scanResult.content ? (scanResult.content.risk * 100).toFixed(1) + '% Risk' : 'N/A'}
                        </div>
                        <p className="text-[0.975rem] text-slate-300 leading-relaxed">
                            {scanResult.content && scanResult.content.reason.length > 0
                                ? scanResult.content.reason[0]
                                : 'Content analysis complete. No fraud indicators detected.'}
                        </p>
                            <div onClick={() => setReportOpen(true)} className='flex justify-end '>
                                <Button  variant={"link"} className="text-white font-normal cursor-pointer mt-2 flex justify-end">View Detailed Report...</Button>
                            </div>
                    </div>

                    {/* Redirect Security Finding */}
                    <div className="bg-white/[0.08] backdrop-blur-[10px] rounded-xl p-6 border border-white/[0.15] ease-in-out duration-400 float-animation hover:shadow-[0px_0px_40px_rgba(59,130,246,0.5)] ">
                            <h3 className="text-2xl text-[#4d9dfe] mb-5 font-bold">Redirects</h3>
                            <div className='flex mb-4 mx-5'>
                                <div className='shrink-0'>
                                    <ProgressCircle WnH={"w-25 h-25"} value={28} />
                                </div>
                                <p className='ml-4 flex flex-wrap gap-2 items-center text-white p-2'>
                                    <Badge variant={"secondary"} className="text-sm"> Theft of Ideantity</Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Stupid </Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Fake Win </Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Theft </Badge>
                                </p>
                            </div>
                        <div className="text-2xl text-white font-bold mb-2">
                            {scanResult.redirects ? scanResult.redirects.redirect_chain.length : 0} Redirect(s)
                        </div>
                        <p className="text-[0.975rem] text-slate-300 leading-relaxed">
                            {scanResult.redirects && scanResult.redirects.cross_domain_redirect
                                ? 'Warning: Cross-domain redirects detected. The URL redirects to different domains.'
                                : scanResult.redirects && scanResult.redirects.redirect_chain.length > 1
                                    ? 'Multiple redirects detected. The URL goes through several pages before reaching destination.'
                                    : 'No suspicious redirects. URL loads directly without unnecessary redirections.'}
                        </p>
                        <div className='flex justify-end '>
                            <Button variant={"link"} className="text-white font-normal cursor-pointer mt-2 flex justify-end">View Detailed Report...</Button>
                        </div>
                    </div>

                    {/* Network Activity Finding */}
                    <div className="bg-white/[0.08] backdrop-blur-[10px] rounded-xl p-6 border border-white/[0.15] ease-in-out duration-400 float-animation hover:shadow-[0px_0px_40px_rgba(59,130,246,0.5)] ">
                        <h3 className="text-2xl text-[#4d9dfe] mb-5 font-bold">Network Activity</h3>
                            <div className='flex mb-4 mx-5'>
                                <div className='shrink-0'>
                                    <ProgressCircle WnH={"w-25 h-25"} value={96} />
                                </div>
                                <p className='ml-4 flex flex-wrap gap-2 items-center text-white p-2'>
                                    <Badge variant={"secondary"} className="text-sm"> Theft of Ideantity</Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Stupid </Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Fake Win </Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Theft </Badge>
                                </p>
                            </div>
                        <div className="text-2xl text-white font-bold mb-2">
                            {scanResult.network ? (scanResult.network.external_requests.length + scanResult.network.post_requests) : 0} Requests
                        </div>
                        <p className="text-[0.975rem] text-slate-300 leading-relaxed">
                            {scanResult.network && (scanResult.network.external_requests.length > 5 || scanResult.network.post_requests > 0)
                                ? `High network activity detected. ${scanResult.network.post_requests} POST requests and ${scanResult.network.external_requests.length} external connections.`
                                : 'Normal network activity. The page loads minimal external content.'}
                        </p>
                            <div className='flex justify-end '>
                                <Button variant={"link"} className="text-white font-normal cursor-pointer mt-2 flex justify-end">View Detailed Report...</Button>
                            </div>
                    </div>

                    {/* Cookie Security Finding */}
                    <div className="bg-white/[0.08] backdrop-blur-[10px] rounded-xl p-6 border border-white/[0.15] ease-in-out duration-400 float-animation hover:shadow-[0px_0px_40px_rgba(59,130,246,0.5)] ">
                        <h3 className="text-2xl text-[#4d9dfe] mb-5 font-bold">Cookie Safety</h3>
                            <div className='flex mb-4 mx-5'>
                                <div className='shrink-0'>
                                    <ProgressCircle WnH={"w-25 h-25"} value={82} />
                                </div>
                                <p className='ml-4 flex flex-wrap gap-2 items-center text-white p-2'>
                                    <Badge variant={"secondary"} className="text-sm"> Theft of Ideantity</Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Stupid </Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Fake Win </Badge>
                                    <Badge variant={"secondary"} className="text-sm"> Theft </Badge>
                                </p>
                            </div>
                        <div className="text-2xl text-white font-bold mb-2">
                            {scanResult.cookies && scanResult.cookies.Cookie_Stealing.length > 0 ? 'At Risk' : 'Secure'}
                        </div>
                        <p className="text-[0.975rem] text-slate-300 leading-relaxed">
                            {scanResult.cookies && scanResult.cookies.Cookie_Stealing.length > 0
                                ? `⚠ Warning: ${scanResult.cookies.Cookie_Stealing.length} potential cookie stealing attempts detected.`
                                : '✓ No cookie stealing attempts detected. Your data appears safe.'}
                        </p>
                            <div className='flex justify-end '>
                                <Button variant={"link"} className="text-white font-normal cursor-pointer mt-2 flex justify-end">View Detailed Report...</Button>
                            </div>
                    </div>
                </div>
                </div>
                <div className='border border-2 border-white mx-[10vh] mt-10 mb-4'></div>
                <div className='flex justify-center text-4xl font-bold text-white text-center items-center gap-1'> <LucideLeaf size={35} className='translate-y-0.5'/> About Malicious Checker</div>
            </div>
            <ReportModal
                isOpen={reportOpen}
                onClose={() => setReportOpen(false)}
            />
        </div>
    );
}