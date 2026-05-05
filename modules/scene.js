// =====================================================
// scene.js — NÂNG CẤP: Post-Processing Bloom + Lighting
// =====================================================
import * as THREE from 'three';
import { EffectComposer }        from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }            from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass }       from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass }            from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

export function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);
    // Fog ấm hơn (hơi nâu vàng) → cảm giác không gian gallery sang
    scene.fog = new THREE.FogExp2(0x100d08, 0.016);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 2.5, 26);

    const canvas = document.querySelector('#bg');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias:       true,
        powerPreference: 'high-performance',
        stencil:         false,
        depth:           true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace    = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled   = false;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.sortObjects         = false;
    renderer.info.autoReset      = true;

    // ── Global Lighting ────────────────────────────────
    // Trần vàng ấm / sàn xanh lạnh nhẹ → chiều sâu tự nhiên không cần shadow
    const hemi = new THREE.HemisphereLight(0xfff5d0, 0x202030, 0.35);
    scene.add(hemi);
    const ambient = new THREE.AmbientLight(0xffe8c0, 0.25);
    scene.add(ambient);

    // ── Post-Processing ────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Bloom nhẹ — tranh tỏa hào quang nhẹ như gallery cao cấp
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.35,  // strength  (0.3–0.5 là đẹp)
        0.4,   // radius
        0.82   // threshold
    );
    composer.addPass(bloomPass);

    // Gamma correction sau bloom để màu không bị wash out
    const gammaPass = new ShaderPass(GammaCorrectionShader);
    gammaPass.renderToScreen = true;
    composer.addPass(gammaPass);

    // ── Resize ─────────────────────────────────────────
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const w = window.innerWidth, h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            composer.setSize(w, h);
            bloomPass.resolution.set(w, h);
        }, 100);
    });

    return { scene, camera, renderer, composer };
}