import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Debug, Physics } from '@react-three/rapier'
import Test from './Test.js'

export default function Experience()
{
    return <>
        <color args={['#191919']} attach={'background'}/>
        <OrbitControls makedefault minPolarAngle={Math.PI/4}maxPolarAngle={Math.PI/2} />
        <PerspectiveCamera makeDefault fov={35} position={[2, 4, -25]} />
        <Physics>
            <Debug />
            <Test />
        </Physics>
       
    </>
}