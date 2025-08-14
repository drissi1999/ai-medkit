import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  interact = 'interact',
}

export default function Player() {
  const playerRef = useRef<THREE.Mesh>(null);
  const { playerPosition, setPlayerPosition, checkNearbyInteractions } = useGameState();
  const [subscribe, get] = useKeyboardControls<Controls>();

  // Movement speed
  const speed = 0.1;

  // Initialize player position
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
    }
  }, []);

  // Handle interactions
  useEffect(() => {
    return subscribe(
      (state) => state.interact,
      (pressed) => {
        if (pressed) {
          console.log("Interact key pressed");
          checkNearbyInteractions(playerPosition);
        }
      }
    );
  }, [subscribe, checkNearbyInteractions, playerPosition]);

  useFrame(() => {
    if (!playerRef.current) return;

    const { forward, backward, leftward, rightward } = get();
    const direction = new THREE.Vector3();

    // Calculate movement direction
    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (leftward) direction.x -= 1;
    if (rightward) direction.x += 1;

    // Normalize and apply speed
    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(speed);
      
      // Update position with boundaries
      const newX = Math.max(-48, Math.min(48, playerRef.current.position.x + direction.x));
      const newZ = Math.max(-48, Math.min(48, playerRef.current.position.z + direction.z));
      
      playerRef.current.position.x = newX;
      playerRef.current.position.z = newZ;
      
      // Update game state
      setPlayerPosition({
        x: newX,
        y: playerPosition.y,
        z: newZ
      });

      // Log movement for debugging
      if (forward || backward || leftward || rightward) {
        console.log(`Player moving to: ${newX.toFixed(1)}, ${newZ.toFixed(1)}`);
      }
    }
  });

  return (
    <mesh ref={playerRef} position={[playerPosition.x, 1, playerPosition.z]} castShadow>
      <boxGeometry args={[1, 2, 1]} />
      <meshLambertMaterial color="#4a90e2" />
    </mesh>
  );
}
