'use server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export async function Verify(email: string,password: string) {

    const res = await fetch("http://localhost:3000/api/auth/login" , {
        method:"POST",
        headers:{"Content-Type":"application/json"} , 
        body:JSON.stringify({email , password})
    }).then((res)=>res.json())

    return {
        msg: res.msg,
        valid: res.valid,
    };
}