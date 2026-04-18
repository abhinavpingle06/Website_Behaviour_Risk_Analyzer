'use server'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export async function Verify(email: string,password: string) {

<<<<<<< HEAD
    const res = await fetch("http://localhost:3000/api/auth/login" , {
=======
    const res = await fetch("http://127.0.0.1:3000/api/auth/login" , {
>>>>>>> 0b04b3d439771333a8c5319e7a60173ee3d38cbf
        method:"POST",
        headers:{"Content-Type":"application/json"} , 
        body:JSON.stringify({email , password})
    }).then((res)=>res.json())

    return {
        msg: res.msg,
        valid: res.valid,
    };
}