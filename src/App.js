import './style.css'
import Experience from './Experience.js'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { KeyboardControls } from '@react-three/drei'

export default function App()
{
    return <>
        <Suspense fallback={null}>
        <KeyboardControls
            map={[
                {name: 'forward', keys: ['ArrowUp', 'KeyW']},
                {name: 'backward', keys: ['ArrowDown', 'KeyS']},
                {name: 'leftward', keys: ['ArrowLeft', 'KeyA']},
                {name: 'rightward', keys: ['ArrowRight', 'KeyD']},
                {name: 'jump', keys: ['Space']}
            ]}
        >
            <Canvas shadows camera={{position: [4, 0, -12], fov: 45}}>
                <Experience />
            </Canvas>
            <Leva collapsed />
        </KeyboardControls>
            
        </Suspense>
    </>
}