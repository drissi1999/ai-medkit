import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";
import { NPC as NPCType } from "../../lib/gameData/cultures";

interface NPCProps {
  npc: NPCType;
  position: [number, number, number];
  cultureId: string;
}

export default function NPC({ npc, position, cultureId }: NPCProps) {
  const npcRef = useRef<THREE.Group>(null);
  const { playerPosition, addInteractable } = useGameState();

  // Register this NPC as an interactable
  useEffect(() => {
    addInteractable({
      id: `${cultureId}-${npc.id}`,
      position: { x: position[0], y: position[1], z: position[2] },
      type: 'npc',
      data: { npc, cultureId },
      interactionRadius: 3
    });
  }, [npc, position, cultureId, addInteractable]);

  // Calculate distance to player for interaction feedback
  const distanceToPlayer = Math.sqrt(
    Math.pow(playerPosition.x - position[0], 2) + 
    Math.pow(playerPosition.z - position[2], 2)
  );
  const isNear = distanceToPlayer < 3;

  // Simple floating animation
  useFrame((state) => {
    if (npcRef.current) {
      npcRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group ref={npcRef} position={position}>
      {/* NPC Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <capsuleGeometry args={[0.5, 1]} />
        <meshLambertMaterial color={npc.color} />
      </mesh>

      {/* NPC Head */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.4]} />
        <meshLambertMaterial color={npc.color} />
      </mesh>

      {/* Interaction indicator */}
      {isNear && (
        <group position={[0, 3, 0]}>
          <Text
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Press E to talk
          </Text>
          <mesh position={[0, -0.5, 0]}>
            <ringGeometry args={[0.8, 1, 16]} />
            <meshBasicMaterial color="yellow" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      {/* NPC Name */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {npc.name}
      </Text>
    </group>
  );
}
