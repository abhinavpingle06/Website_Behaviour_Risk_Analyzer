
"use server"

import { cookies } from "next/headers"
import jwt, { JwtPayload } from "jsonwebtoken"
import { pool } from "@/db/connection"
export async function userInfo() {

    const cookieStore = await cookies()
    const token = cookieStore.get("iBuildThis")?.value
    if (!token) return null

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
    ) as JwtPayload
    const email = decoded.email
    
    const userData = await pool.query(`
            select name , socials , bio from users
            where email=$1
            `, [email])
    console.log("decoded:", userData.rows)

    return userData.rows


}
