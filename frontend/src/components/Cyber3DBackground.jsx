import React, { useEffect, useRef } from 'react';

const ORBIT_TOKENS = [
  'FIREWALL', '01011010', 'IDS_ACTIVE', '192.168.1.1', 'SHA256', '0x7FFF',
  'SYN_FLOOD', '11001001', 'PORT:4444', 'TLS_1.3', 'EXPLOIT', '10.0.0.42',
  'TCP_STREAM', '0x00A4', 'ZERO_DAY', '256-BIT', 'ENCRYPT', '172.16.0.8',
  'PACKET_DPI', '01100110', 'DNS_GUARD', 'PORT:443', 'ROOT_SEC', '0xF4C2',
  'DROP_PKT', '10110101', 'ALLOW', 'SSH_GUARD', 'NET_SHIELD', '0x8080',
  'ARP_SYNC', '00111001', 'MALWARE', 'HMAC_256', 'PORT_SCAN', '0xBEEF'
];

const THEME_PALETTES = {
  green: {
    primary: '0, 255, 136',
    secondary: '16, 185, 129',
    highlight: '204, 255, 234',
    accent: '0, 229, 255',
    alert: '255, 51, 102',
    hex: '#00ff88',
  },
  blue: {
    primary: '0, 168, 255',
    secondary: '56, 189, 248',
    highlight: '214, 242, 255',
    accent: '0, 255, 204',
    alert: '255, 51, 102',
    hex: '#00a8ff',
  },
  red: {
    primary: '255, 51, 102',
    secondary: '244, 63, 94',
    highlight: '255, 214, 224',
    accent: '255, 170, 0',
    alert: '255, 80, 120',
    hex: '#ff3366',
  },
};

// 3D rotation helpers
function rotatePoint(p, rx, ry, rz) {
  let { x, y, z } = p;

  // Rotate around X
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  let y1 = y * cosX - z * sinX;
  let z1 = y * sinX + z * cosX;
  y = y1;
  z = z1;

  // Rotate around Y
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  let x2 = x * cosY + z * sinY;
  let z2 = -x * sinY + z * cosY;
  x = x2;
  z = z2;

  // Rotate around Z
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  let x3 = x * cosZ - y * sinZ;
  let y3 = x * sinZ + y * cosZ;

  return { x: x3, y: y3, z };
}

export default function Cyber3DBackground({
  theme = 'green',
  enabled = true,
  speed = 1.0,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!enabled) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId = null;

    const palette = THEME_PALETTES[theme] || THEME_PALETTES.green;

    // Mouse subtle 3D parallax
    const mouse = { targetX: 0, targetY: 0, x: 0, y: 0 };

    // Build 3D Wireframe Globe points (latitude / longitude grid)
    const latSteps = 8;
    const lonSteps = 16;
    const globeVertices = [];
    for (let i = 0; i <= latSteps; i++) {
      const phi = (Math.PI * i) / latSteps - Math.PI / 2;
      const ring = [];
      for (let j = 0; j < lonSteps; j++) {
        const theta = (Math.PI * 2 * j) / lonSteps;
        ring.push({
          x: Math.cos(phi) * Math.cos(theta),
          y: Math.sin(phi),
          z: Math.cos(phi) * Math.sin(theta),
        });
      }
      globeVertices.push(ring);
    }

    // Build 3D Inner Icosahedron / Cyber Crystal Core
    const t = (1 + Math.sqrt(5)) / 2;
    const rawCore = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ].map(([x, y, z]) => {
      const len = Math.hypot(x, y, z);
      return { x: x / len, y: y / len, z: z / len };
    });

    const coreEdges = [];
    for (let i = 0; i < rawCore.length; i++) {
      for (let j = i + 1; j < rawCore.length; j++) {
        const d = Math.hypot(
          rawCore[i].x - rawCore[j].x,
          rawCore[i].y - rawCore[j].y,
          rawCore[i].z - rawCore[j].z
        );
        if (d < 1.15) coreEdges.push([i, j]);
      }
    }

    // Build 3D Orbiting Cybersecurity Words & Numbers across tilted orbital rings + deep space shell
    const orbitingItems = ORBIT_TOKENS.map((text, idx) => {
      const ringIndex = idx % 3; // 3 tilted 3D orbital planes
      const angle = (idx / ORBIT_TOKENS.length) * Math.PI * 2 * 3 + Math.random() * 0.4;
      const radiusFactor =
        ringIndex === 0 ? 1.38 : ringIndex === 1 ? 1.72 : 2.08;
      const isAlert =
        text.includes('EXPLOIT') ||
        text.includes('FLOOD') ||
        text.includes('4444') ||
        text.includes('ZERO_DAY') ||
        text.includes('MALWARE') ||
        text.includes('DROP_PKT');
      const isNumber = /^[0-9xA-F.:-]+$/i.test(text);

      return {
        text,
        ringIndex,
        baseAngle: angle,
        radiusFactor: radiusFactor + (Math.random() * 0.14 - 0.07),
        yOffset: (Math.random() - 0.5) * 0.45,
        orbitSpeed: (ringIndex === 0 ? 0.0055 : ringIndex === 1 ? -0.0042 : 0.0032),
        isAlert,
        isNumber,
      };
    });

    // Build 3D floating micro-binary particles around the full viewport
    const spaceParticles = Array.from({ length: 44 }, (_, i) => ({
      x: (Math.random() - 0.5) * 3.8,
      y: (Math.random() - 0.5) * 2.4,
      z: (Math.random() - 0.5) * 2.8,
      label: i % 3 === 0 ? (i % 2 === 0 ? '01' : '10') : i % 3 === 1 ? '0x' + ((i * 37) % 255).toString(16).toUpperCase().padStart(2, '0') : '•',
      speedY: (Math.random() - 0.5) * 0.0025,
    }));

    let angleY = 0;
    let angleCore = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / width - 0.5) * 0.6;
      mouse.targetY = (e.clientY / height - 0.5) * 0.4;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const project = (pt, scale, cx, cy, fov) => {
      const zCam = pt.z * scale + fov;
      if (zCam <= 10) return null;
      const factor = fov / zCam;
      return {
        sx: cx + pt.x * scale * factor,
        sy: cy + pt.y * scale * factor,
        depth: factor, // larger = closer to viewer
        z: pt.z,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const cx = width * 0.5;
      const cy = height * 0.52;
      const baseRadius = Math.min(width, height) * 0.31;
      const fov = baseRadius * 3.2;

      const s = Math.max(0.2, Math.min(2.5, speed || 1.0));
      angleY += 0.0042 * s;
      angleCore -= 0.0075 * s;

      const tiltX = 0.28 + mouse.y;
      const rotY = angleY + mouse.x;

      // --- 1. Draw 3D Floating Binary/Hex Space Field ---
      ctx.font = "600 10px 'JetBrains Mono', Consolas, monospace";
      for (let i = 0; i < spaceParticles.length; i++) {
        const sp = spaceParticles[i];
        const rp = rotatePoint(sp, tiltX * 0.4, angleY * 0.35, 0);
        const proj = project(rp, baseRadius * 1.3, cx, cy, fov);
        if (!proj) continue;
        const alpha = Math.max(0.06, Math.min(0.32, (proj.depth - 0.55) * 0.5));
        ctx.fillStyle = `rgba(${palette.secondary}, ${alpha.toFixed(2)})`;
        ctx.fillText(sp.label, proj.sx, proj.sy);
      }

      // --- 2. Draw 3D Tilted Orbital Ring Wireframes ---
      const ringTilts = [
        { rx: 0.45 + mouse.y, ry: rotY * 0.6, rz: 0.25, r: 1.38 },
        { rx: -0.52 + mouse.y, ry: -rotY * 0.5, rz: -0.32, r: 1.72 },
        { rx: 0.18 + mouse.y, ry: rotY * 0.35, rz: 0.55, r: 2.08 },
      ];

      ringTilts.forEach((ring, rIdx) => {
        ctx.beginPath();
        const segs = 64;
        let started = false;
        for (let k = 0; k <= segs; k++) {
          const a = (Math.PI * 2 * k) / segs;
          const pt = rotatePoint(
            { x: Math.cos(a) * ring.r, y: 0, z: Math.sin(a) * ring.r },
            ring.rx,
            ring.ry,
            ring.rz
          );
          const pr = project(pt, baseRadius, cx, cy, fov);
          if (!pr) continue;
          if (!started) {
            ctx.moveTo(pr.sx, pr.sy);
            started = true;
          } else {
            ctx.lineTo(pr.sx, pr.sy);
          }
        }
        ctx.strokeStyle = `rgba(${palette.primary}, ${rIdx === 0 ? 0.22 : rIdx === 1 ? 0.16 : 0.11})`;
        ctx.lineWidth = rIdx === 0 ? 1.2 : 0.9;
        ctx.stroke();
      });

      // --- 3. Draw 3D Wireframe Cyber Globe (Latitude & Longitude Lines + Nodes) ---
      const projectedGlobe = globeVertices.map((ring) =>
        ring.map((v) => {
          const rv = rotatePoint(v, tiltX, rotY, 0.08);
          return project(rv, baseRadius, cx, cy, fov);
        })
      );

      // Latitude lines
      for (let i = 1; i < latSteps; i++) {
        ctx.beginPath();
        for (let j = 0; j <= lonSteps; j++) {
          const p = projectedGlobe[i][j % lonSteps];
          if (!p) continue;
          if (j === 0) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        }
        ctx.strokeStyle = `rgba(${palette.primary}, 0.17)`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      // Longitude lines & glowing surface vertices
      for (let j = 0; j < lonSteps; j++) {
        ctx.beginPath();
        for (let i = 0; i <= latSteps; i++) {
          const p = projectedGlobe[i][j];
          if (!p) continue;
          if (i === 0) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        }
        ctx.strokeStyle = `rgba(${palette.secondary}, 0.14)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Glowing globe intersection nodes (depth-shaded)
      for (let i = 1; i < latSteps; i++) {
        for (let j = 0; j < lonSteps; j++) {
          const p = projectedGlobe[i][j];
          if (!p) continue;
          const isFront = p.z < 0;
          const alpha = isFront ? 0.65 : 0.15;
          const rad = isFront ? 2.1 : 1.1;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, rad, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${isFront ? palette.highlight : palette.primary}, ${alpha})`;
          ctx.fill();
        }
      }

      // --- 4. Draw Inner 3D Counter-Rotating Cyber Crystal (Icosahedron) ---
      const coreScale = baseRadius * 0.56;
      const projectedCore = rawCore.map((v) => {
        const rv = rotatePoint(v, angleCore * 0.7 + mouse.y, angleCore, angleCore * 0.4);
        return project(rv, coreScale, cx, cy, fov);
      });

      ctx.beginPath();
      for (const [aIdx, bIdx] of coreEdges) {
        const pa = projectedCore[aIdx];
        const pb = projectedCore[bIdx];
        if (!pa || !pb) continue;
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
      }
      ctx.strokeStyle = `rgba(${palette.accent}, 0.42)`;
      ctx.lineWidth = 1.35;
      ctx.stroke();

      for (const pc of projectedCore) {
        if (!pc) continue;
        ctx.beginPath();
        ctx.arc(pc.sx, pc.sy, pc.z < 0 ? 2.8 : 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${palette.highlight}, ${pc.z < 0 ? 0.85 : 0.3})`;
        ctx.fill();
      }

      // --- 5. Draw 3D Orbiting Cybersecurity Words & Numbers (Depth-Sorted Back-to-Front) ---
      const projectedTokens = [];
      for (let i = 0; i < orbitingItems.length; i++) {
        const item = orbitingItems[i];
        item.baseAngle += item.orbitSpeed * s;

        const rTilt = ringTilts[item.ringIndex];
        const rawPt = {
          x: Math.cos(item.baseAngle) * item.radiusFactor,
          y: item.yOffset,
          z: Math.sin(item.baseAngle) * item.radiusFactor,
        };
        const rp = rotatePoint(rawPt, rTilt.rx, rTilt.ry, rTilt.rz);
        const pr = project(rp, baseRadius, cx, cy, fov);
        if (pr) {
          projectedTokens.push({ item, pr });
        }
      }

      // Painter's algorithm: draw farthest tokens first, closest bright tokens on top
      projectedTokens.sort((a, b) => b.pr.z - a.pr.z);

      for (let i = 0; i < projectedTokens.length; i++) {
        const { item, pr } = projectedTokens[i];
        // Depth factor from back (-1) to front (+1)
        const frontness = Math.max(0, Math.min(1, (1.6 - pr.z) / 3.2));
        const fontSize = Math.round(9 + frontness * 6); // 9px in back -> 15px in front
        const alpha = (0.16 + frontness * 0.78).toFixed(2);

        ctx.font = `${frontness > 0.6 ? '700' : '600'} ${fontSize}px 'JetBrains Mono', Consolas, monospace`;

        const colorRgb = item.isAlert
          ? palette.alert
          : item.isNumber
          ? palette.accent
          : frontness > 0.72
          ? palette.highlight
          : palette.primary;

        if (frontness > 0.68) {
          ctx.shadowColor = `rgba(${colorRgb}, 0.75)`;
          ctx.shadowBlur = 9;
        }

        ctx.fillStyle = `rgba(${colorRgb}, ${alpha})`;
        ctx.fillText(item.text, pr.sx, pr.sy);
        ctx.shadowBlur = 0;

        // Subtle connecting leader dot on front tokens
        if (frontness > 0.55) {
          ctx.beginPath();
          ctx.arc(pr.sx - 6, pr.sy - fontSize * 0.32, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorRgb}, ${alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme, enabled, speed]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      id="cyber-3d-bg"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
