import './style.css'
import Experience from './Experience.js'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'

export default function App()
{
    return <>
        <Suspense fallback={null}>
            <Canvas shadows camera={{position: [4, 0, -12], fov: 45}}>
                <Experience />
            </Canvas>
            <Leva collapsed />
        </Suspense>
    </>
}