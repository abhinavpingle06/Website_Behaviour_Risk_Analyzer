import { Shield } from "lucide-react";
import Login from "./form";
import Image from "next/image";

export default function LoginPage(){
    return (
        <main className="min-h-screen flex flex-col text-center items-center pt-[6%] bg-blue-300/40 ">
            <div className="flex pb-15 gap-3 text-blue-600 text-center items-center">
                {/* <Image src='/globe.svg' alt="App Image" className="items-center" width={50} height={50} /> */}
                <Shield className="w-15 h-15"/>
                <h1 className="font-extrabold text-6xl">Secure360</h1>
            </div>
            
            <div className="rounded-sm w-auto h-auto text-black ">
                <Login/>
            </div>
        </main>
    )
}