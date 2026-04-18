import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { pool } from "@/db/connection"
import bcrypt from "bcryptjs"
import 'dotenv/config';

export async function POST(req: Request) {

    const { email, pass } = await req.json()
    const role = "user"

    if (!email.trim() || !pass.trim()) {
        return NextResponse.json({valid:false , msg:"Empty field were provided"})
    }
    // Fetch user
    const result = await pool.query(
        "SELECT email, hash_pass FROM users WHERE email=$1",
        [email]
    )

    if (result.rowCount === 0) {
        return NextResponse.json({ valid: false, msg: "Email not found" })
    }

    const user = result.rows[0]
    const isMatch = await bcrypt.compare(pass, user.hash_pass)
    if (!isMatch) {
        return NextResponse.json({ valid: false, msg: "Password incorrect" })
    }

    // JWT token
    const token = jwt.sign({ email , role }, process.env.JWT_SECRET!, { expiresIn: "15m" })

    // Create a response
    const response = NextResponse.json({ valid: true, msg: "Login successful" })

    // Set cookie via NextResponse headers
    response.cookies.set({
        name: "iBuildThis",
        value: token,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 15 minutes
    })

    return response
}

