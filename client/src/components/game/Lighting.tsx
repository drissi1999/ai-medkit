export default function Lighting() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      
      {/* Additional directional light from opposite side */}
      <directionalLight
        position={[-10, 5, -10]}
        intensity={0.3}
        color="#ffffff"
      />
      
      {/* Subtle point light for atmosphere */}
      <pointLight
        position={[0, 15, 0]}
        intensity={0.2}
        color="#4a90e2"
        distance={100}
      />
    </>
  );
}
