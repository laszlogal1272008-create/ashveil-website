import { useRef, useEffect } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import './LightRays.css';

function LightRays() {
	const canvasRef = useRef(null);
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const renderer = new Renderer({ canvas, width: window.innerWidth, height: window.innerHeight });
		const gl = renderer.gl;
		gl.clearColor(0, 0, 0, 0);
		const vertex = `
			attribute vec2 uv;
			attribute vec2 position;
			varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = vec4(position, 0, 1);
			}
		`;
		const fragment = `
			precision highp float;
			varying vec2 vUv;
			uniform float uTime;
			void main() {
				vec2 uv = vUv - 0.5;
				float angle = atan(uv.y, uv.x);
				float radius = length(uv);
				float rays = abs(sin(angle * 12.0 + uTime * 0.8)) * 0.9;
				float glow = smoothstep(0.4, 0.6, 0.5 - radius) * 0.8;
				float intensity = rays * glow;
				
				// Volcanic red-orange gradient
				vec3 emberColor = vec3(1.0, 0.27, 0.0); // #ff4500 ember orange
				vec3 deepRed = vec3(0.545, 0.0, 0.0);   // #8B0000 deep red
				vec3 finalColor = mix(deepRed, emberColor, intensity * 0.7);
				
				gl_FragColor = vec4(finalColor, intensity * 0.6);
			}
		`;
		const program = new Program(gl, {
			vertex,
			fragment,
			uniforms: {
				uTime: { value: 0 },
			},
		});
		const triangle = new Triangle(gl);
		const mesh = new Mesh(gl, { geometry: triangle, program });
		let animationId;
		let startTime = performance.now();
		function animate() {
			program.uniforms.uTime.value = (performance.now() - startTime) * 0.001;
			renderer.render({ scene: { children: [mesh] } });
			animationId = requestAnimationFrame(animate);
		}
		animate();
		return () => {
			cancelAnimationFrame(animationId);
			renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	}, []);
	return (
	  <div className="light-rays-container">
	    <canvas ref={canvasRef} className="light-rays-canvas" />
	  </div>
	);
}

export default LightRays;
// ...rest of LightRays.jsx code as previously provided...
// (omitted here for brevity, but will be copied in full)
