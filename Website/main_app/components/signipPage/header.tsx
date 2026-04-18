import Image from "next/image"
import Link from "next/link"

export default function Header(){
    return (
        <div className="flex justify-center bg-black pt-3 pb-3 text-white ">
            <div className="flex text-2xl font-bold px-5">
                <Image src='/globe.svg' alt="App Image" width={35} height={35} />
                <p className="pl-1.5 text-4xl">iBuiltThis</p>
            </div>
        </div>
    )
}