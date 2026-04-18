"use server"
import { headers } from "next/headers";

export async function getUser() {
    const headersList = await headers(); 
    const userHeader = headersList.get("iBuiltThisUser");

    if (!userHeader) return null;

    return JSON.parse(userHeader);
}
