import { Perf } from 'r3f-perf'
import { RigidBody, useFixedJoint, useRevoluteJoint, CylinderCollider, RapierRigidBody } from '@react-three/rapier'
import { useKeyboardControls } from '@react-three/drei'
import React, { createRef, RefObject, useEffect, useMemo, useRef} from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Quaternion, Vector3, Vector3Tuple, Vector4Tuple } from 'three'
// import { create } from 'zustand'

export default function Test()
{
    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    // // controls
    // const CONTROLS = {
    //     forward: 'forward',
    //     back: 'back',
    //     left: 'left',
    //     right: 'right',
    //     brake: 'brake',
    // }
    
    // const CONTROLS_MAP = [
    //     { name: CONTROLS.forward, keys: ['ArrowUp', 'w', 'W'] },
    //     { name: CONTROLS.back, keys: ['ArrowDown', 's', 'S'] },
    //     { name: CONTROLS.left, keys: ['ArrowLeft', 'a', 'A'] },
    //     { name: CONTROLS.right, keys: ['ArrowRight', 'd', 'D'] },
    //     { name: CONTROLS.brake, keys: ['Space'] },
    // ]

    // constants
    const RAPIER_UPDATE_PRIORITY = -50
    const AFTER_RAPIER_UPDATE = RAPIER_UPDATE_PRIORITY - 1

    const AXLE_TO_CHASSIS_JOINT_STIFFNESS = 150000
    const AXLE_TO_CHASSIS_JOINT_DAMPING = 20

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

    const AxelJoint = ({
        body,
        wheel,
        bodyAnchor,
        WheelAnchor,
        rotationAxis,
        isDriven
    }) => {
        const joint = useRevoluteJoint(body, wheel, [
            bodyAnchor,
            WheelAnchor,
            rotationAxis
        ])


        // useFrame((state, delta) =>
        // {
        //     const { forward, backward } = getKeys()

        //     if(!isDriven) return

        //     let f = 0
        //     if(forward) f += 1
        //     if(backward) f -= 1

        //     f *= DRIVEN_WHEEL_FORCE

        //     if(f != 0)
        //     {
        //         wheel.current?.wakeUp()
        //     }

        //     joint.current?.configureMotorVelocity(f, DRIVEN_WHEEL_DAMPING)

        // })

        useEffect(() => 
        {
            const { forward, backward } = getKeys()
            if(!isDriven) return 
            let forth = 0
        })
        // const forwardPressed = useKeyboardControls((state) => state.forward)
        // console.log(forwardPressed)
        // const backwardPressed = useKeyboardControls((state) => state.back)

        // useEffect(() => {
        //     if(!isDriven) return

        //     let forward = 0
        //     if(forwardPressed) forward += 1
        //     if(backwardPressed) forward -= 1

        //     forward *= DRIVEN_WHEEL_FORCE

        //     if(forward != 0)
        //     {
        //         wheel.curren?.wakeUp()
        //     }

        //     joint.current?.configureMotorVelocity(forward, DRIVEN_WHEEL_DAMPING)
        // }, [forwardPressed, backwardPressed])

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
        })

        // const left = useKeyboardControls((state) => state.left)
        // const right = useKeyboardControls((state) => state.right)
        // const targetPos = left ? 0.2 : right ? -0.2 : 0

        // useEffect(() => {
        //     joint.current?.configureMotorPosition(
        //         targetPos,
        //         AXLE_TO_CHASSIS_JOINT_STIFFNESS,
        //         AXLE_TO_CHASSIS_JOINT_DAMPING
        //     )
        // }, [left, right])

        return null
    }

    const RevoluteJointVehicle = () => {
        const camera = useThree((state) => state.camera)
        const currentCameraPosition = useRef(new Vector3(15,15,0))
        const currentCameraLookAt = useRef(new Vector3())

        const chassisRef = useRef(null)

        const wheels = [
            {
                axlePosition: [-1.2, -0.6, 0.7],
                wheelPosition: [-1.2, -0.4, 1],
                isSteered: true,
                side: 'left',
                isDriven: false,
            },
            {
                axlePosition: [-1.2, -0.6, -0.7],
                wheelPosition: [-1.2, -0.4, -1],
                isSteered: true,
                side: 'right',
                isDriven: false,
            },
            {
                axlePosition: [1.2, -0.6, 0.7],
                wheelPosition: [1.2, -0.4, 1],
                isSteered: false,
                side: 'left',
                isDriven: true,
            },
            {
                axlePosition: [1.2, -0.6, -0.7],
                wheelPosition: [1.2, -0.4, -1],
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

        console.log(axleRefs.current)

        useFrame((_, delta) => {
            if (!chassisRef.current) {
                return
            }
            const t = 1. - Math.pow(0.01, delta)
            const idealOffset = new Vector3(10, 5, 0)
            idealOffset.applyQuaternion(chassisRef.current.rotation())
            idealOffset.add(chassisRef.current.translation())
            if(idealOffset.y < 0) {idealOffset.y = 0}

            const idealLookAt = new Vector3(0, 1, 0)
            idealLookAt.applyQuaternion(chassisRef.current.rotation())
            idealLookAt.add(chassisRef.current.translation())

            currentCameraPosition.current.lerp(idealOffset, t)
            currentCameraLookAt.current.lerp(idealLookAt, t)

            camera.position.copy(currentCameraPosition.current)
            camera.lookAt(currentCameraLookAt.current)
        }, AFTER_RAPIER_UPDATE)

        return <>
            
            <group>
                {/* chassis */}
                <RigidBody ref={chassisRef} collider='cuboid' mass={1}>
                    <mesh>
                        <boxGeometry args={[3.5, 0.5, 1.5]} castShadow receiveShadow />
                        <meshStandardMaterial color='red' />
                    </mesh>
                </RigidBody>

                {/* wheels */}
                {wheels.map((wheel, i) => (
                    <React.Fragment key={i}>
                        {/* axle */}
                        <RigidBody ref={axleRefs.current[i]} position={wheel.axlePosition} colliders='cuboid'>
                            <mesh rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
                                <boxGeometry args={[0.3, 0.3, 0.3]} />
                                <meshStandardMaterial color='green' />
                            </mesh>
                        </RigidBody>

                        {/* wheel */}
                        <RigidBody ref={wheelRefs.current[i]} position={wheel.wheelPosition} colliders={false}>
                            <mesh rotation-x={-Math.PI / 2} castShadow receiveShadow>
                                <cylinderGeometry args={[0.25, 0.25, 0.24, 32]}/>
                                <meshStandardMaterial color={['orange']} />
                            </mesh>
                            <mesh rotation-x={-Math.PI / 2}>
                                <cylinderGeometry args={[0.251, 0.251, 0.241, 16]}/>
                                <meshStandardMaterial color="yellow" wireframe/>
                            </mesh>
                            <CylinderCollider mass={0.5} friction={1.5} args={[0.124, 0.25]} rotation={[-Math.PI/2, 0, 0]}/>
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
                        {/* <AxelJoint 
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
                        /> */}
                    </React.Fragment>
                ))}
            </group>
        </>
    }


    return <>
        <Perf position={'top-left'} showGraph={'false'} minimal={'true'}/>
        <RevoluteJointVehicle /> 
        <RigidBody type='fixed' position-y={-5}>
            <mesh >
                <meshBasicMaterial color={'grey'} />
                <boxGeometry args={[20, 0.1, 20]} />
            </mesh>
        </RigidBody>    
    </>
}

