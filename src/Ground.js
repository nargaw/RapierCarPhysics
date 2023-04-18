import { Grid } from '@react-three/drei'
import { useControls } from 'leva'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Ground()
{
    const ground = useRef()
    const { gridSize, ...gridConfig } = useControls(
        'ground', {
            gridSize: [15.5, 15.5],
            cellSize: { value: 0.6, min: 0, max: 10, step: 0.1 },
            cellThickness: { value: 1, min: 0, max: 5, step: 0.1 },
            cellColor: '#fff',
            sectionSize: { value: 0, min: 0, max: 10, step: 0.1 },
            sectionThickness: { value: 0, min: 0, max: 5, step: 0.1 },
            sectionColor: '#fff',
            fadeDistance: { value: 15, min: 0, max: 100, step: 1 },
            fadeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
            followCamera: false,
            infiniteGrid: true
        }, {collapsed: true}
    )

    // useFrame((state, delta) =>{
    //     let t = state.clock.getElapsedTime() * 0.75
    //     ground.current.position.z = t % 3
    //   })

    return <>
        <Grid ref={ground} position={[0, 0.8, 0]} args={gridSize} {...gridConfig} />
        
    </>
}