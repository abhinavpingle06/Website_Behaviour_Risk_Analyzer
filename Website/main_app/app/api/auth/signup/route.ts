import { pool } from "@/db/connection"
import { NextResponse } from "next/server"

export async function POST(req:Request){
    try{
        const {email} =await req.json()

        const data = await pool.query(
            `Select email from users
            where email=$1`,[email]
        )
        if(data)
            return NextResponse.json({
                msg:"Email already exists",
                status:402 , 
                valid:false
        })

    } catch(err) {
        console.log(err)
    }
}