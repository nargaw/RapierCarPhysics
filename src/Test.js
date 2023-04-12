import { Perf } from 'r3f-perf'
import { RigidBody, useFixedJoint, useRevoluteJoint, CylinderCollider, RapierRigidBody } from '@react-three/rapier'
import { KeyboardControls } from '@react-three/drei'
import React, { createRef, RefObject, useEffect, useMemo, useRef} from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { create } from 'zustand'

export default function Test()
{
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

        const axleRefs = useRef(
            wheels.map(() => createRef())
        )

        useFrame((_, delta) => {
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
        }, -51)

        return <>
        
        </>
    }


    return <>
        <Perf position={'top-left'} showGraph={'false'} minimal={'true'}/>
        <RigidBody>
            <mesh>
                <meshBasicMaterial color={'white'} />
                <boxGeometry args={[1, 1, 1]}/>
            </mesh>
        </RigidBody>
        <RigidBody type='fixed' position-y={-5}>
            <mesh >
                <meshBasicMaterial color={'grey'} />
                <boxGeometry args={[20, 0.1, 20]} />
            </mesh>
        </RigidBody>    
    </>
}

