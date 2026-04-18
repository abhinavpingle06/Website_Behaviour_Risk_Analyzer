'usse client'
import { motion } from "framer-motion"

export default function FadeRight({children}:{children:React.ReactNode}){
    return(
        <motion.div 
        initial={{opacity:0, }}>
            {children}
        </motion.div>
    )
}