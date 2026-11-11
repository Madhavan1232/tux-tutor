import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

/**
 * Fallback circular placeholder matching dark card/surface styling while the GLB streams in.
 */
export function TuxPlaceholder({ size }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#161414',
        flexShrink: 0,
      }}
    />
  );
}

/**
 * Guards against WebGL context creation errors so a driver/headless issue never breaks a route.
 */
class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Shared transparent-alpha `<Canvas>` stage with dark-theme lighting + `#E53E3E` rear rim accent.
 */
export default function TuxCanvasStage({
  size = 80,
  camera = { position: [0, 0.05, 2.85], fov: 36, near: 0.1, far: 50 },
  extraLights = null,
  children,
}) {
  return (
    <WebGLErrorBoundary fallback={<TuxPlaceholder size={size} />}>
      <Suspense fallback={<TuxPlaceholder size={size} />}>
        <Canvas
          dpr={[1, 2]}
          shadows={false}
          camera={camera}
          gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
          style={{
            width: size,
            height: size,
            background: 'transparent',
            display: 'block',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <ambientLight intensity={1.15} color="#cbd5e1" />
          {/* Cool key light from above-left */}
          <directionalLight position={[-3, 4, 4]} intensity={2.1} color="#dceeff" />
          {/* Subtle front fill so dark plumage separates cleanly on dark surfaces */}
          <directionalLight position={[1.5, 0.5, 3.5]} intensity={0.65} color="#e2e8f0" />
          {/* Red rear rim light matching #E53E3E brand accent */}
          <directionalLight position={[2.5, 2, -4]} intensity={1.9} color="#E53E3E" />
          {extraLights}
          {children}
        </Canvas>
      </Suspense>
    </WebGLErrorBoundary>
  );
}

