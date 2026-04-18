import { pool } from "@/db/connection";

export async function GET() {
    try {
        const result = await pool.query(
            `SELECT title, badges , votes, soln, screenshots_url FROM projects 
            order by votes desc 
            limit 5
            `
        );

        return new Response(JSON.stringify(result.rows), { status: 200 });
        
    } catch (err) {
        console.error('DB error:', err);
        return new Response('Internal Server Error', { status: 500 });
    }
}
