import { useRef } from "react"

export default function Lights()
{
    const directionalLight = useRef()

    return <>
        <directionalLight ref={ directionalLight } position={ [ 0, 5, -5] } intensity={ 2.5 } />
        <pointLight position={[5, 2, -5]} intensity={1}/>
        <pointLight position={[-5, 2, -5]} intensity={1}/>
        <ambientLight intensity={1.}/>
    </>
}