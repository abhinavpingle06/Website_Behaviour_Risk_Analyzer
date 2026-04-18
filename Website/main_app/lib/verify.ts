"use server"
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';


export async function VerifyToken(token:any){
  
    try {
        const decoded = jwt.verify(token , "Abhinav")
        return decoded as {email: string}
    } catch (error) {
        return {email:"false"}
    }
    
}