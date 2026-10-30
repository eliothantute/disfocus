import * as THREE from 'three';
import { ParticleField } from './ParticleField.js';
import { HeroVertexShader, HeroFragmentShader } from './HeroShader.js';

export class SceneManager {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.heroPlaneContainer = document.getElementById('hero-webgl-plane');
    
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0, uX: 0.5, uY: 0.5 };
    this.time = 0;
    this.audioIntensity = 0;
    this.isHoveringHero = 0;
    this.targetHover = 0;

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030305, 0.032);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 11);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 3. Particle Field
    this.particles = new ParticleField(this.scene, 1400);

    // 4. Hero 3D Interactive Mesh
    this.createHeroMesh();

    // 5. Ambient 3D Rings
    this.createCyberAccents();

    // 6. Bind Events
    this.bindEvents();
  }

  createHeroMesh() {
    const textureLoader = new THREE.TextureLoader();
    // Use disfocus-live-1.jpg
    const heroTexture = textureLoader.load('/assets/images/disfocus-live-1.jpg', (tex) => {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
    });

    // 3:2 landscape aspect ratio (9.6 x 6.4)
    const geometry = new THREE.PlaneGeometry(9.6, 6.4, 96, 64);

    this.heroUniforms = {
      uTexture: { value: heroTexture },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uAudio: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: HeroVertexShader,
      fragmentShader: HeroFragmentShader,
      uniforms: this.heroUniforms,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.heroMesh = new THREE.Mesh(geometry, material);
    this.heroMesh.position.set(0, 0.2, 0.5);
    this.scene.add(this.heroMesh);

    // Outer subtle glowing wireframe frame
    const wireGeo = new THREE.PlaneGeometry(9.7, 6.5, 24, 16);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xff2a85,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    this.wireMesh = new THREE.Mesh(wireGeo, wireMat);
    this.wireMesh.position.set(0, 0.2, 0.45);
    this.scene.add(this.wireMesh);
  }

  createCyberAccents() {
    const ringGeo1 = new THREE.TorusGeometry(8.5, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      transparent: true,
      opacity: 0.22
    });
    this.ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    this.ring1.position.set(0, 0, -5);
    this.ring1.rotation.x = Math.PI * 0.35;
    this.scene.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(12.5, 0.015, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xff2a85,
      transparent: true,
      opacity: 0.14
    });
    this.ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.ring2.position.set(0, 0, -8);
    this.ring2.rotation.y = Math.PI * 0.25;
    this.scene.add(this.ring2);
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

      this.mouse.uX = e.clientX / window.innerWidth;
      this.mouse.uY = 1.0 - (e.clientY / window.innerHeight);
    });

    if (this.heroPlaneContainer) {
      this.heroPlaneContainer.addEventListener('mouseenter', () => {
        this.targetHover = 1.0;
      });

      this.heroPlaneContainer.addEventListener('mouseleave', () => {
        this.targetHover = 0.0;
      });
    }

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (this.heroUniforms) {
      this.heroUniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }
  }

  setAudioIntensity(val) {
    this.audioIntensity = val;
  }

  render(deltaTime) {
    this.time += deltaTime;

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;
    this.isHoveringHero += (this.targetHover - this.isHoveringHero) * 0.08;

    if (this.particles) {
      this.particles.update(this.time, this.mouse, this.audioIntensity);
    }

    if (this.heroMesh && this.heroUniforms) {
      this.heroUniforms.uTime.value = this.time;
      this.heroUniforms.uHover.value = this.isHoveringHero;
      this.heroUniforms.uAudio.value = this.audioIntensity;
      this.heroUniforms.uMouse.value.set(this.mouse.uX, this.mouse.uY);

      this.heroMesh.rotation.y = this.mouse.x * 0.22;
      this.heroMesh.rotation.x = -this.mouse.y * 0.18;
      this.heroMesh.position.x = this.mouse.x * 0.25;
      this.heroMesh.position.y = 0.2 + this.mouse.y * 0.2;

      if (this.wireMesh) {
        this.wireMesh.rotation.copy(this.heroMesh.rotation);
        this.wireMesh.position.copy(this.heroMesh.position);
      }
    }

    if (this.ring1) {
      this.ring1.rotation.z = this.time * 0.08;
      this.ring1.rotation.x = Math.PI * 0.35 + this.mouse.y * 0.1;
    }
    if (this.ring2) {
      this.ring2.rotation.z = -this.time * 0.05;
      this.ring2.rotation.y = Math.PI * 0.25 + this.mouse.x * 0.1;
    }

    this.camera.position.x = this.mouse.x * 0.4;
    this.camera.position.y = this.mouse.y * 0.25;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}
