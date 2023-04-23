import { Perf } from 'r3f-perf'
import { RigidBody, useFixedJoint, useRevoluteJoint, CylinderCollider, RapierRigidBody, CuboidCollider } from '@react-three/rapier'
import { useGLTF, useKeyboardControls } from '@react-three/drei'
import React, { createRef, RefObject, useEffect, useMemo, useRef} from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Quaternion, Vector3, Vector3Tuple, Vector4Tuple } from 'three'
import { useControls } from 'leva'
import { useRapier } from '@react-three/rapier'

export default function Test()
{

    const [ subscribeKeys, getKeys ] = useKeyboardControls()

    const ref = useRef()
    const body = useRef()
    const rightRear = useRef()
    const leftRear = useRef()
    const rightFront = useRef()
    const leftFront = useRef()

    const { nodes, materials } = useGLTF('Bronco.glb')
    // console.log(nodes)
    const { color } = useControls('Body Color', { color:'#a9a9a9' })
    const { bullBar } = useControls('Bull Bar', {bullBar: true})
    const { seats } = useControls('Seats', { seats:'#828282' })
    const { wheels } = useControls('Wheels', { wheels:'#1f3152' })
    const { radiator } = useControls('Radiator', { radiator:'#6f6f6f' })
    const { ammo } = useControls('Ammo', { ammo:'#1f3152' })
    // console.log(bullBar)
    // console.log(color)
    document.body.style.backgroundColor = color

    // constants
    const RAPIER_UPDATE_PRIORITY = -50
    const AFTER_RAPIER_UPDATE = RAPIER_UPDATE_PRIORITY - 1

    const AXLE_TO_CHASSIS_JOINT_STIFFNESS = 30000
    const AXLE_TO_CHASSIS_JOINT_DAMPING = 2

    const DRIVEN_WHEEL_FORCE = 600
    const DRIVEN_WHEEL_DAMPING = 5

    const FixedJoint = ({
        body,
        wheel,
        body1Anchor,
        body1LocalFrame,
        body2Anchor,
        body2LocalFrame,
    }) => {
        useFixedJoint(body, wheel, [
            body1Anchor,
            body1LocalFrame,
            body2Anchor,
            body2LocalFrame
        ])

        return null
    }

    const AxleJoint = ({
        body,
        wheel,
        bodyAnchor,
        wheelAnchor,
        rotationAxis,
        isDriven
    }) => {
        const joint = useRevoluteJoint(body, wheel, [
            bodyAnchor,
            wheelAnchor,
            rotationAxis
        ])


        useFrame((state, delta) =>
        {
            const { forward, backward } = getKeys()

            if(!isDriven) return

            let f = 0
            if(forward) f += 1
            if(backward) f -= 1

            f *= DRIVEN_WHEEL_FORCE

            if(f != 0)
            {
                wheel.current?.wakeUp()
            }

            // console.log(joint.current.configureMotor)

            joint.current?.configureMotorVelocity(f, DRIVEN_WHEEL_DAMPING)

        })

        return null
    }

    const SteeredJoint = ({
        body,
        wheel,
        bodyAnchor,
        wheelAnchor,
        rotationAxis,
    }) => {
        const joint = useRevoluteJoint(body, wheel, [
            bodyAnchor,
            wheelAnchor,
            rotationAxis
        ])

        

        useFrame((state, delta) => {
            const {leftward, rightward } = getKeys()

            const targetPos = leftward ? 0.2 : rightward ? -0.2: 0
            joint.current?.configureMotorPosition(
                targetPos,
                AXLE_TO_CHASSIS_JOINT_STIFFNESS,
                AXLE_TO_CHASSIS_JOINT_DAMPING
            )
            // console.log(leftward)
        })

        return null
    }

    const RevoluteJointVehicle = () => {
        const camera = useThree((state) => state.camera)
        const currentCameraPosition = useRef(new Vector3(15,15,0))
        const currentCameraLookAt = useRef(new Vector3())

        const chassisRef = useRef(null)

        const wheels = [
            {
                // axlePosition: [-1.2, -0.6, 0.7],
                // wheelPosition: [-1.2, -0.4, 1],
                axlePosition: [-0.52, -0.6, 0.1],
                wheelPosition: [-1.0, -0.4, 1],
                isSteered: true,
                side: 'left',
                isDriven: false,
            },
            {
                // axlePosition: [-1.2, -0.6, -0.7],
                // wheelPosition: [-1.2, -0.4, -1],
                axlePosition: [-0.52, -0.6, -0.075],
                wheelPosition: [-1.0, -0.4, -1],
                isSteered: true,
                side: 'right',
                isDriven: false,
            },
            {
                // axlePosition: [1.2, -0.6, 0.7],
                // wheelPosition: [1.2, -0.4, 1],
                axlePosition: [0.52, -0.6, 0.1],
                wheelPosition: [1.0, -0.4, 1],
                isSteered: false,
                side: 'left',
                isDriven: true,
            },
            {
                // axlePosition: [1.2, -0.6, -0.7],
                // wheelPosition: [1.2, -0.4, -1],
                axlePosition: [0.52, -0.6, -0.075],
                wheelPosition: [1.0, -0.4, -1],
                isSteered: false,
                side: 'right',
                isDriven: true,
            },
        ]

        const wheelRefs = useRef(
            wheels.map(() => createRef())
        )
        // console.log(wheelRefs.current)

        const axleRefs = useRef(
            wheels.map(() => createRef())
        )

        // console.log(axleRefs.current)

        // useFrame((_, delta) => {
        //     if (!chassisRef.current) {
        //         return
        //     }
        //     const t = 1. - Math.pow(0.01, delta)
        //     const idealOffset = new Vector3(10, 5, 0)
        //     idealOffset.applyQuaternion(chassisRef.current.rotation())
        //     idealOffset.add(chassisRef.current.translation())
        //     if(idealOffset.y < 0) {
        //         idealOffset.y = 5
        //     }

        //     const idealLookAt = new Vector3(0, 2, 0)
        //     idealLookAt.applyQuaternion(chassisRef.current.rotation())
        //     idealLookAt.add(chassisRef.current.translation())

        //     currentCameraPosition.current.lerp(idealOffset, t)
        //     currentCameraLookAt.current.lerp(idealLookAt, t)

        //     camera.position.copy(currentCameraPosition.current)
        //     camera.lookAt(currentCameraLookAt.current)
        // }, AFTER_RAPIER_UPDATE)


        return <>
            <group dispose={null} castShadow ref={ref} scale={[0.25, 0.25, 0.25]} position={[0, -0.5, 0]}>

            <RigidBody ref={chassisRef} colliders={false} mass={1}>
                <CuboidCollider position={[0, 0, 0]} args={[3, .95, 2]} />
                <group castShadow ref={body} position={[0, -3.25, 0]} rotation={[0, Math.PI * 0.5, 0]}>
                {/* merge bodyframe doors fender */}
                <mesh castShadow geometry={nodes.BodyFrame.geometry} position={nodes.BodyFrame.position}  material={materials.BodyFrame} material-color={color}/>

                {/* merge all ammos 0-4 */}
                <mesh castShadow geometry={nodes.Ammo.geometry} position={nodes.Ammo.position} rotation={nodes.Ammo.rotation} material={materials.Ammo0} material-color={ammo}/>

                {/*bull bar*/}
                {bullBar && <mesh castShadow geometry={nodes.bull_bar.geometry} position={nodes.bull_bar.position} rotation={nodes.bull_bar.rotation} material={materials['Black Metal']}/>}
                
                {/* Dash */}
                <mesh castShadow geometry={nodes.Dash.geometry} position={nodes.Dash.position} rotation={nodes.Dash.rotation} material={materials['Black plastic']}/>

                 {/* logo */}
                 <mesh castShadow geometry={nodes.FastWheelLogo.geometry} position={nodes.FastWheelLogo.position} rotation={nodes.Logo.rotation} material={''}/>
                <mesh castShadow geometry={nodes.Logo.geometry} position={nodes.Logo.position} rotation={nodes.Logo.rotation} material={materials['Logo.001']}/>
                <mesh castShadow geometry={nodes.LogoFrame.geometry} position={nodes.LogoFrame.position} rotation={nodes.LogoFrame.rotation} material={materials['Black plastic']}/>

                {/* front radiator frame */}
                <mesh castShadow geometry={nodes.FrontRadiatorFrame.geometry} position={nodes.FrontRadiatorFrame.position} rotation={nodes.FrontRadiatorFrame.rotation} material={materials['Black Metal.001']} material-color={radiator} />

                {/* front weapon */}
                <mesh castShadow geometry={nodes.FrontWeaponAmmo.geometry} position={nodes.FrontWeaponAmmo.position} rotation={nodes.FrontWeaponAmmo.rotation} material={materials['Ammo0']}/>
                <mesh castShadow geometry={nodes.FrontWeaponAmmoShell.geometry} position={nodes.FrontWeaponAmmoShell.position} rotation={nodes.FrontWeaponAmmoShell.rotation} material={materials['Black plastic']}/>
                <mesh castShadow geometry={nodes.FrontWeaponCaseBody.geometry} position={nodes.FrontWeaponCaseBody.position} rotation={nodes.FrontWeaponCaseBody.rotation} material={materials['Black Metal']}/>

                {/* headlight */}
                <mesh castShadow geometry={nodes.HeadLightCover.geometry} position={nodes.HeadLightCover.position} rotation={nodes.HeadLightCover.rotation} material={materials['Black Metal']}/>
                <mesh castShadow geometry={nodes.HeadLightRim.geometry} position={nodes.HeadLightRim.position} rotation={nodes.HeadLightRim.rotation} material={materials['Black plastic']}/>
                <mesh castShadow geometry={nodes.HeadLightRoundRim.geometry} position={nodes.HeadLightRoundRim.position} rotation={nodes.HeadLightRoundRim.rotation} material={materials['Black plastic']}/>

                {/* interior */}
                <mesh castShadow geometry={nodes.Interior.geometry} position={nodes.Interior.position} rotation={nodes.Interior.rotation} material={materials['Black plastic']}/>

                {/* Light */}
                <mesh castShadow geometry={nodes.Light.geometry} position={nodes.Light.position} rotation={nodes.Light.rotation} material={materials.Light}/>
                <mesh castShadow geometry={nodes.LightHead.geometry} position={nodes.LightHead.position} rotation={nodes.LightHead.rotation} material={materials.LightHead}/>

                {/* metal cab frame */}
                <mesh castShadow geometry={nodes.MetalCabFrame.geometry} position={nodes.MetalCabFrame.position} rotation={nodes.MetalCabFrame.rotation} material={materials['Black Metal']}/>

                {/* radiator */}
                <mesh castShadow geometry={nodes.Radiator.geometry} position={nodes.Radiator.position} rotation={nodes.Radiator.rotation} material={materials['Black Metal']} />

                {/* seats */}
                <mesh castShadow geometry={nodes.Seats.geometry} position={nodes.Seats.position} rotation={nodes.Seats.rotation} material={materials['Rubber.002']} material-color={seats}/>

                {/* steering wheel */}
                <mesh castShadow geometry={nodes.SteeringWheelBase.geometry} position={nodes.SteeringWheelBase.position} rotation={nodes.SteeringWheelBase.rotation} material={materials['Black Metal']}/>
                <mesh castShadow geometry={nodes.Steering_Wheel_1.geometry} position={nodes.Steering_Wheel.position} rotation={nodes.Steering_Wheel.rotation} material={materials['Rubber']}/>
                <mesh castShadow geometry={nodes.Steering_Wheel_2.geometry} position={nodes.Steering_Wheel.position} rotation={nodes.Steering_Wheel.rotation} material={materials['Rubber']}/>

                {/* Top Light */}
                <mesh castShadow geometry={nodes.TopLightBase.geometry} position={nodes.TopLightBase.position} rotation={nodes.TopLightBase.rotation} material={materials['Black Metal']}/>
                <mesh castShadow geometry={nodes.TopLightFrame.geometry} position={nodes.TopLightFrame.position} rotation={nodes.TopLightFrame.rotation} material={materials['Black Metal']}/>
                <mesh castShadow geometry={nodes.TopLights.geometry} position={nodes.TopLights.position} rotation={nodes.TopLights.rotation} material={materials['Black Metal']}/>

                {/* weapons */}
                <mesh castShadow geometry={nodes.WeaponChargeLabel.geometry} position={nodes.WeaponChargeLabel.position} rotation={nodes.WeaponChargeLabel.rotation} material={materials['WeaponChargeLabel']}/>
                <mesh castShadow geometry={nodes.WeaponCoverMesh_1.geometry} position={nodes.WeaponCoverMesh.position} rotation={nodes.WeaponCoverMesh.rotation} material={materials['Black Metal']}/>
                <mesh castShadow geometry={nodes.WeaponCoverMesh_2.geometry} position={nodes.WeaponCoverMesh.position} rotation={nodes.WeaponCoverMesh.rotation} material={materials['Black Metal']}/>
                <mesh castShadow geometry={nodes.WeaponGlassCase.geometry} position={nodes.WeaponGlassCase.position} rotation={nodes.WeaponGlassCase.rotation}> 
                    {/* {config.fakeTransmissionMaterial ? <meshStandardMaterial color={'#ffffff'} opacity={0.35} metalness={1.} roughness={0.2} transparent={'true'}/>: <MeshTransmissionMaterial background={new THREE.Color(color)} {...config} />}  */}
                    <meshStandardMaterial color={'#ffffff'} opacity={0.35} metalness={1.} roughness={0.2} transparent={'true'}/>
                </mesh>

                {/* windshield */}
                <mesh castShadow geometry={nodes.Windshield.geometry} position={nodes.Windshield.position} rotation={nodes.Windshield.rotation}>
                <meshStandardMaterial color={'#ffffff'} opacity={0.35} metalness={1.} roughness={0.2} transparent={'true'}/>   
                {/* {config.fakeTransmissionMaterial ? <meshStandardMaterial color={'#ffffff'} opacity={0.35} metalness={1.} roughness={0.} transparent={'true'}/> : <MeshTransmissionMaterial background={new THREE.Color(color)} {...config} />} */}
                </mesh>

                </group>
            </RigidBody>
            
            
                    
    
            </group>
            <group>
                {/* chassis */}
                {/* <RigidBody ref={chassisRef} collider='cuboid' mass={1}> */}
                    {/* <mesh castShadow receiveShadow geometry={nodes.BodyFrame.geometry} scale={[0.5, 0.5, 0.5]}> */}
                        {/* <boxGeometry args={[3.5, 0.5, 1.5]}  /> */}
                        {/* <meshStandardMaterial color='red' /> */}
                    {/* </mesh> */}
                {/* </RigidBody> */}

                {/* wheels */}
                {wheels.map((wheel, i) => (
                    <React.Fragment key={i}>
                        {/* axle */}
                        <RigidBody ref={axleRefs.current[i]} position={wheel.axlePosition} colliders='cuboid'>
                            <mesh rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow position={[0, 0, wheel.side === 'left' ? 0.125 : -0.125,]}>
                                <boxGeometry args={[0.25, 0.25, 0.25]} />
                                <meshStandardMaterial color='green' />
                            </mesh>
                        </RigidBody>

                        {/* wheel */}
                        <RigidBody ref={wheelRefs.current[i]} position={wheel.wheelPosition} colliders={false}>
                       
                        
                            <mesh rotation-x={-Math.PI / 2} castShadow receiveShadow>
                                <cylinderGeometry args={[0.2, 0.2, 0.2, 32]}/>
                                <meshStandardMaterial color={['orange']} />
                            </mesh>
                            <mesh rotation-x={-Math.PI / 2}>
                                <cylinderGeometry args={[0.2, 0.2, 0.201, 16]}/>
                                <meshStandardMaterial color="yellow" wireframe/>
                            </mesh>
                            <CylinderCollider mass={0.5} friction={1.5} args={[0.1, 0.2]} rotation={[-Math.PI/2, 0, 0]}/>
                        </RigidBody>

                        {/* connect axle to chassis */}
                        {!wheel.isSteered ? (
                            <FixedJoint 
                                body={chassisRef}
                                wheel={axleRefs.current[i]}
                                body1Anchor={wheel.axlePosition}
                                body1LocalFrame={[0, 0, 0, 1]}
                                body2Anchor={[0, 0, 0]}
                                body2LocalFrame={[0, 0, 0, 1]}
                            />
                        ) : (
                            <SteeredJoint 
                                body={chassisRef}
                                wheel={axleRefs.current[i]}
                                bodyAnchor={wheel.axlePosition}
                                wheelAnchor={[0, 0, 0]}
                                rotationAxis={[0, 1, 0]}
                            />
                        )}
                        
                        {/* connect wheel to axle */}
                        <AxleJoint
                            body={axleRefs.current[i]}
                            wheel={wheelRefs.current[i]}
                            bodyAnchor={[
                                0,
                                0,
                                wheel.side === 'left' ? 0.35 : -0.35,
                            ]}
                            wheelAnchor={[0, 0, 0]}
                            rotationAxis={[0, 0, 1]}
                            isDriven={wheel.isDriven}
                        />
                        
                    </React.Fragment>
                ))}
            </group>
        </>
    }

    const RapierConfiguration = () => {
        const rapier = useRapier()
    
        useEffect(() => {
            const world = rapier.world.raw()
    
            if (!world) return
            world.maxStabilizationIterations = 50
            world.maxVelocityFrictionIterations = 50
            world.maxVelocityIterations = 100
        }, [])
    
        return null
    }


    return <>
        <RapierConfiguration />
        <Perf position={'top-left'} showGraph={'false'} minimal={'true'}/>
        <RevoluteJointVehicle /> 
        <RigidBody type='fixed' position-y={-5}>
            <mesh >
                <meshBasicMaterial color={'grey'} visible={false} />
                <boxGeometry args={[200, 0.1, 200]} />
            </mesh>
        </RigidBody>    
    </>
}

