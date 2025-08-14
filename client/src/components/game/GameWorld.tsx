import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import Player from "./Player";
import CulturalRegion from "./CulturalRegion";
import Lighting from "./Lighting";
import { cultures } from "../../lib/gameData/cultures";

export default function GameWorld() {
  const worldRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // Optional: Add any world-level animations here
  });

  return (
    <group ref={worldRef}>
      {/* Lighting */}
      <Lighting />
      
      {/* Terrain */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[100, 1, 100]} />
        <meshLambertMaterial color="#2d3748" />
      </mesh>

      {/* Player */}
      <Player />

      {/* Cultural Regions */}
      {cultures.map((culture, index) => (
        <CulturalRegion
          key={culture.id}
          culture={culture}
          position={culture.position}
        />
      ))}

      {/* Boundaries - invisible walls */}
      <mesh position={[50, 5, 0]}>
        <boxGeometry args={[1, 10, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh position={[-50, 5, 0]}>
        <boxGeometry args={[1, 10, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh position={[0, 5, 50]}>
        <boxGeometry args={[100, 10, 1]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh position={[0, 5, -50]}>
        <boxGeometry args={[100, 10, 1]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}
