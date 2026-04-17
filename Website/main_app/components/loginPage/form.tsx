'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTransition, useState } from "react"
import { EyeClosedIcon, EyeIcon } from "lucide-react"


export default function Login() {
    const [showPass , setShowPass] = useState(false)
    const [isvalid , setIsvalid] = useState(true)
    const [validmsg , setValidmsg] = useState("")
    const [isPending , startTransition] = useTransition()
    

    async function HandelonVerification(e: any){
            e.preventDefault()
            
            // console.log(e.target) //React returns jsx instead of value
            setIsvalid(true)
            console.log(process.env.DATABASE_URL);
            const formData = new FormData(e.target)
            const email = formData.get("email")?.toString() ?? ""
            const pass = formData.get("password")?.toString() ?? "" //fetchs from name and converts to string from formfiledata
            startTransition(async () => {
                var res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, pass })
                }).then((res) => res.json())

                if(res.valid)
                    window.location.href ="/profile"

                setIsvalid(res.valid)
                setValidmsg(res.msg)
            })
            
            
        }

    const [filled, setFilled] = useState('')
    const [pass, setPass] = useState("")

    function Handelvalue(e: any) {
        console.log(e)
        setFilled(e.target.value)
    }

    function Handelpass(e: any) {
        console.log(e)
        setPass(e.target.value)
    }

    return (
        <form onSubmit={HandelonVerification}
        className="flex items-center justify-center bg-white/10 backdrop-blur-md shadow-2xl rounded-2xl p-10">
            <div className="w-full max-w-lg space-y-2 ">
                <h1 className="text-4xl font-bold rounded-2xl p-4 font-sm text-center -translate-y-2">Log Into Account</h1>
                <div className="text-medium font-medium text-black space-y-2">
                    <p>Welcome Back!!!</p> 
                    <p>New here? <span className="font-bold text-center items-center"><Link href={'/signup'} className="hover:underline">Create An Account</Link></span></p> 
                </div>
                <div className="space-y-5 pt-1">
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-lg">Email</Label>
                        <Input name="email"
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            style={{
                                background: filled.length ? 'white' : "transparent",
                                color: filled.length ? 'black' : "black"
                            }}
                            onChange={Handelvalue}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2 relative">
                        <Label htmlFor="password" className="text-lg">Password</Label>
                        <div className="relative">
                            <Input name="password"
                                id="password"
                                type={showPass ? "text" : "password"}
                                placeholder="••••••••"
                                style={{
                                    background: pass.length ? 'white' : "transparent",
                                    color: pass.length ? 'black' : "black"
                                }}
                                onChange={Handelpass}
                            />
                            <button onClick={() => setShowPass(!showPass)} type="button" className="absolute right-2.5 top-1.5">
                                {
                                    showPass ? <EyeClosedIcon className={pass.length ? "text-black" : "text-white"} />: <EyeIcon className={pass.length ? "text-black" : "text-white"} />
                                }
                            </button>
                        </div>
                    </div>
                    <div className="pb-2">
                        {
                            !isvalid && <p className=" text-red-500 text-sm font-medium "> {validmsg} </p>
                        }

                        {
                            isPending && <p className="text-blue-900 text-sm font-medium animate-pulse">Processing....</p>

                        }
                    </div>
                </div>

                <Button className="w-full border border-blue-950 text-lg text-white bg-blue-700 hover:bg-blue-500" variant={"ghost"} type="submit" >Log in</Button>
            </div>
        </form>
    )
}

