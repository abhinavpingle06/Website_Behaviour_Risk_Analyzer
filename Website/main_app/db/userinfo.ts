import { getUser } from "@/lib/getuser";
import { pool } from "./connection";
import { redirect } from "next/navigation";

export async function UserInfo(){
    const userData =await getUser()
    console.log(userData)
    if (userData==null){
        redirect("/login")
    }
    const userinfo = await pool.query(`
        select * from users
        where email=$1
        `, [userData.email])
        
    return userinfo.rows
}