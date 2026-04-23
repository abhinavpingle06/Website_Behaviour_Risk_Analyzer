import { Shield } from "lucide-react";
import SignupForm from "./form";
import Image from "next/image";

export default function SignupPage() {
    return (
        <main className="min-h-screen flex flex-col text-center items-center pt-[6%] bg-blue-300/40 ">
            <div className="rounded-sm w-auto h-auto text-white text-center items-center ">
                <div className="flex pb-15 gap-3 pl-7 text-blue-600 text-center items-center">
                    <Shield className="w-15 h-15" />
                    <h1 className="font-extrabold text-6xl">Secure360</h1>
                </div>
                <SignupForm />
            </div>
        </main>
    )
}