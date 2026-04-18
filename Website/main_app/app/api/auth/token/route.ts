import { pool } from "@/db/connection";
import { VerifyToken } from "@/lib/verify";
import { NextRequest, NextResponse } from "next/server";

type DecodedToken = {
    email: string;
    role: string;
    iat: number;
    exp: number;
};

export async function GET(req: NextRequest) {
    const token = req.cookies.get("iBuildThis")?.value;
    console.log(token)
    return NextResponse.json({ token: token })
}

export async function POST(req: NextRequest) {
    const { token } = await req.json();


    if (!token) {
        return NextResponse.json(
            { error: "Token missing" },
            { status: 401 }
        );
    }

    const userInfoDecoded = (await VerifyToken(token)) as DecodedToken;


    console.log("Decoded:", userInfoDecoded);


    const userinfo = await pool.query(
        `
        SELECT name, socials, bio , username
        FROM users
        WHERE email = $1
        `,
        [userInfoDecoded.email]
    );
    return NextResponse.json(userinfo.rows[0]);
}