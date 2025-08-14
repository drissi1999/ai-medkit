import { useRef, useState, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import NPC from "./NPC";
import { Culture } from "../../lib/gameData/cultures";

interface CulturalRegionProps {
  culture: Culture;
  position: [number, number, number];
}

export default function CulturalRegion({ culture, position }: CulturalRegionProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Pre-calculate random positions for NPCs and structures
  const npcPositions = useMemo(() => {
    return Array.from({ length: culture.npcs.length }, (_, i) => [
      position[0] + (Math.random() - 0.5) * 8,
      0,
      position[2] + (Math.random() - 0.5) * 8,
    ] as [number, number, number]);
  }, [culture.npcs.length, position]);

  const structurePositions = useMemo(() => {
    return Array.from({ length: 3 }, () => [
      position[0] + (Math.random() - 0.5) * 10,
      1,
      position[2] + (Math.random() - 0.5) * 10,
    ] as [number, number, number]);
  }, [position]);

  // Load appropriate texture based on culture theme
  const getRegionTexture = () => {
    switch (culture.theme) {
      case 'ice': return '/textures/sky.png';
      case 'desert': return '/textures/sand.jpg';
      case 'forest': return '/textures/grass.png';
      case 'stone': return '/textures/asphalt.png';
      default: return '/textures/grass.png';
    }
  };

  const texture = useTexture(getRegionTexture());

  return (
    <group ref={groupRef} position={position}>
      {/* Region ground */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <cylinderGeometry args={[12, 12, 0.2, 16]} />
        <meshLambertMaterial map={texture} color={culture.color} />
      </mesh>

      {/* Region boundary marker */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
        <meshLambertMaterial color={culture.color} />
      </mesh>

      {/* Cultural structures */}
      {structurePositions.map((structPos, i) => (
        <mesh key={`structure-${i}`} position={structPos} castShadow>
          <boxGeometry args={[2, 3, 2]} />
          <meshLambertMaterial color={culture.color} opacity={0.8} transparent />
        </mesh>
      ))}

      {/* NPCs */}
      {culture.npcs.map((npc, index) => (
        <NPC
          key={`${culture.id}-npc-${index}`}
          npc={npc}
          position={npcPositions[index]}
          cultureId={culture.id}
        />
      ))}

      {/* Region name label (floating text would need a different approach) */}
      <mesh position={[0, 4, 0]}>
        <planeGeometry args={[6, 1]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
