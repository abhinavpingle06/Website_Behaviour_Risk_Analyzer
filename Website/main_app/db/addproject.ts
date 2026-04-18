import { title } from "process";
import { pool } from "./connection";
import { getUser } from "@/lib/getuser";

interface Props {
    title: string;
    desc: string;
    oneline: string;
    techStack: string[];
    screenshot: string[];
    username:string;
    code:string;
}

export async function AddProjectInDB(info: Props) {
    try {
        await pool.query(`
        insert into projects (title ,problem_stat, soln , category , screenshots_url , votes , username, json_code)
        values ($1 , $2 , $3 , $4 , $5, 0 , $6, $7)`, [info.title, info.oneline, info.desc, info.techStack, info.screenshot , info.username, info.code])
    }
    catch (err) {
        console.log(err)
    }
}