"use client"
import TypingAnimation from "@/components/ui/typingAnimation";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-800">
      {/* Header */}
      <header className="p-6">
        <nav className="max-w-screen mx-auto flex justify-between items-center">
          <div className="flex text-4xl gap-2 font-bold content-center text-center text-indigo-600">
            <Shield className="w-10 h-10"/>
            Secure360
          </div>
          <div className="space-x-4 text-xl">
            <a
              href="/profile"
              className="px-6 py-2 font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      <div className="border border-indigo-600/80 max-w-[90rem] mx-auto"></div>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-300 mb-6">
            <TypingAnimation
              sequence={[
                "We Educate You About Digital Phishing Attacks 🕵️...",
                2000,
                "We Help You Stay Safe Online 🌍...",
                2000,
              ]}
            />
          </h1>
          <p className="text-xl text-gray-400/80 mb-12 max-w-3xl mx-auto">
            AI-powered Web-Behaviour Analyzer & Phishing Texts/Fake AI Voices Detector
            <br/>
            <i>Stay safe in the digital world</i>
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            {/* Phishing Text Detection */}
            <div className=" bg-[#141a3e] border border-blue-500 p-8 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-103 duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                Phishing Text Detection
              </h3>
              <p className="text-gray-300">
                Instantly identify malicious messages and protect yourself from
                phishing attacks with our advanced text analysis.
              </p>
            </div>

            {/* Fake AI Voice Detection */}
            <div className="bg-[#141a3e]  p-8 border border-blue-500 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-103 duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                Fake AI Voice Detection
              </h3>
              <p className="text-gray-300">
                Detect deepfake and AI-generated voices to verify authenticity
                and prevent voice-based fraud.
              </p>
            </div>
          </div>
          {/* Web Detection */}
          <div className="max-w-[50%] mx-auto my-10 ">
            <div className="bg-[#141a3e] p-8 rounded-xl border border-blue-500 shadow-lg hover:shadow-2xl transition transform hover:scale-103 duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12A9 9 0 1112 3a9 9 0 019 9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                Web Activity Analysis
              </h3>
              <p className="text-gray-300">
                Analyze web behavior & network activity patterns to identify threats, scams, and malicious activity.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600">
        <p>&copy; 2026 Secure360. All rights reserved.</p>
      </footer>
    </div>
  );
}