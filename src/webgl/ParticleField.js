import * as THREE from 'three';

export class ParticleField {
  constructor(scene, count = 1200) {
    this.scene = scene;
    this.count = count;
    this.init();
  }

  init() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const scales = new Float32Array(this.count);
    const originalPositions = new Float32Array(this.count * 3);

    const mauve = new THREE.Color('#9d4edd');
    const pink = new THREE.Color('#ff2a85');
    const deepViolet = new THREE.Color('#4c1d95');

    for (let i = 0; i < this.count; i++) {
      // Spread across 3D space
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 35;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Color variation between Mauve & Pink
      const randColor = Math.random();
      let chosenColor;
      if (randColor < 0.45) {
        chosenColor = mauve;
      } else if (randColor < 0.85) {
        chosenColor = pink;
      } else {
        chosenColor = deepViolet;
      }

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      scales[i] = Math.random() * 2.5 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    this.originalPositions = originalPositions;

    // Custom Particle Shader Material
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aScale;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uAudio;

        void main() {
          vColor = color;
          vec3 pos = position;

          // Gentle floating motion
          pos.y += sin(uTime * 0.8 + pos.x * 0.5) * 0.4;
          pos.x += cos(uTime * 0.6 + pos.z * 0.4) * 0.3;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          gl_PointSize = aScale * (120.0 / -mvPosition.z) * (1.0 + uAudio * 1.5);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Circular particle shape with soft glow falloff
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.05, dist);
          gl_FragColor = vec4(vColor, alpha * 0.85);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uAudio: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    this.mesh = new THREE.Points(geometry, material);
    this.scene.add(this.mesh);
  }

  update(time, mouse, audioValue = 0) {
    if (!this.mesh) return;

    this.mesh.material.uniforms.uTime.value = time;
    this.mesh.material.uniforms.uAudio.value = audioValue;

    // Slow rotation
    this.mesh.rotation.y = time * 0.03 + mouse.x * 0.15;
    this.mesh.rotation.x = mouse.y * 0.1;
  }
}
