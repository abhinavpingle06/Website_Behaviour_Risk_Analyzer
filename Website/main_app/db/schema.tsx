import { pool } from "./connection";

export default async function getProjectImages(){
    try {
        const ssObj = await pool.query(
            `select screenshots_url from projects`
        )
        return ssObj
    } catch (error) {
        console.log(error)
    }
    
}