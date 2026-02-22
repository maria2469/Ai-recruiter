import { useEffect, useRef, useCallback } from "react";

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    baseRadius: number;
    pulse: number;
    pulseSpeed: number;
    color: string;
    type: "core" | "node" | "particle";
}

interface WavePoint {
    phase: number;
    amplitude: number;
    frequency: number;
}

const COLORS = {
    blue: "59, 130, 246",
    cyan: "6, 182, 212",
    indigo: "99, 102, 241",
    violet: "139, 92, 246",
};

const HeroCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const nodesRef = useRef<Node[]>([]);
    const waveRef = useRef<WavePoint[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const timeRef = useRef(0);
    const initializedRef = useRef(false);

    const initNodes = useCallback((w: number, h: number) => {
        const nodes: Node[] = [];
        const colorKeys = Object.keys(COLORS) as (keyof typeof COLORS)[];

        // Core AI nodes — larger, brighter
        const corePositions = [
            { x: w * 0.15, y: h * 0.3 },
            { x: w * 0.25, y: h * 0.7 },
            { x: w * 0.08, y: h * 0.55 },
            { x: w * 0.35, y: h * 0.45 },
            { x: w * 0.42, y: h * 0.2 },
            { x: w * 0.5, y: h * 0.8 },
        ];

        corePositions.forEach((pos, i) => {
            nodes.push({
                x: pos.x,
                y: pos.y,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: 4 + Math.random() * 3,
                baseRadius: 4 + Math.random() * 3,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.02,
                color: COLORS[colorKeys[i % colorKeys.length]],
                type: "core",
            });
        });

        // Medium network nodes
        for (let i = 0; i < 25; i++) {
            nodes.push({
                x: Math.random() * w * 0.6,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: 2 + Math.random() * 2,
                baseRadius: 2 + Math.random() * 2,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.03 + Math.random() * 0.02,
                color: COLORS[colorKeys[Math.floor(Math.random() * colorKeys.length)]],
                type: "node",
            });
        }

        // Tiny floating particles
        for (let i = 0; i < 50; i++) {
            nodes.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: 1 + Math.random(),
                baseRadius: 1 + Math.random(),
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.04 + Math.random() * 0.03,
                color: COLORS[colorKeys[Math.floor(Math.random() * colorKeys.length)]],
                type: "particle",
            });
        }

        nodesRef.current = nodes;

        // Voice waveform points
        const wave: WavePoint[] = [];
        for (let i = 0; i < 80; i++) {
            wave.push({
                phase: (i / 80) * Math.PI * 4,
                amplitude: 8 + Math.random() * 20,
                frequency: 1 + Math.random() * 2,
            });
        }
        waveRef.current = wave;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio, 2);
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            if (!initializedRef.current) {
                initNodes(rect.width, rect.height);
                initializedRef.current = true;
            }
        };
        resize();
        window.addEventListener("resize", resize);

        const handleMouse = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        canvas.addEventListener("mousemove", handleMouse);

        const draw = () => {
            const rect = canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            timeRef.current += 0.016;
            const t = timeRef.current;

            ctx.clearRect(0, 0, w, h);

            const nodes = nodesRef.current;
            const mouse = mouseRef.current;

            // Update & draw nodes
            nodes.forEach((node) => {
                node.x += node.vx;
                node.y += node.vy;
                node.pulse += node.pulseSpeed;

                // Bounce off edges
                if (node.x < 0 || node.x > w) node.vx *= -1;
                if (node.y < 0 || node.y > h) node.vy *= -1;
                node.x = Math.max(0, Math.min(w, node.x));
                node.y = Math.max(0, Math.min(h, node.y));

                // Mouse interaction — gentle repulsion
                const dx = node.x - mouse.x;
                const dy = node.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120 && dist > 0) {
                    const force = (120 - dist) / 120 * 0.8;
                    node.vx += (dx / dist) * force * 0.1;
                    node.vy += (dy / dist) * force * 0.1;
                }

                // Dampen velocity
                node.vx *= 0.99;
                node.vy *= 0.99;

                // Pulsing radius
                node.radius = node.baseRadius + Math.sin(node.pulse) * node.baseRadius * 0.3;
            });

            // Draw connections between nearby nodes (neural network effect)
            const connectionDist = 150;
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].type === "particle") continue;
                for (let j = i + 1; j < nodes.length; j++) {
                    if (nodes[j].type === "particle") continue;
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDist) {
                        const alpha = (1 - dist / connectionDist) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(${nodes[i].color}, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();

                        // Traveling pulse along connection
                        const pulsePos = (Math.sin(t * 2 + i + j) + 1) / 2;
                        const px = nodes[i].x + (nodes[j].x - nodes[i].x) * pulsePos;
                        const py = nodes[i].y + (nodes[j].y - nodes[i].y) * pulsePos;
                        ctx.beginPath();
                        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${nodes[i].color}, ${alpha * 3})`;
                        ctx.fill();
                    }
                }
            }

            // Draw nodes with glow
            nodes.forEach((node) => {
                const glowSize = node.type === "core" ? 20 : node.type === "node" ? 12 : 6;
                const gradient = ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, glowSize
                );
                gradient.addColorStop(0, `rgba(${node.color}, ${node.type === "core" ? 0.8 : 0.5})`);
                gradient.addColorStop(0.5, `rgba(${node.color}, ${node.type === "core" ? 0.2 : 0.1})`);
                gradient.addColorStop(1, `rgba(${node.color}, 0)`);

                ctx.beginPath();
                ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${node.color}, ${node.type === "core" ? 0.9 : 0.6})`;
                ctx.fill();
            });

            // Voice waveform — bottom-center area, subtle
            const waveY = h * 0.88;
            const waveStartX = w * 0.05;
            const waveWidth = w * 0.45;
            const wave = waveRef.current;

            ctx.beginPath();
            ctx.moveTo(waveStartX, waveY);
            wave.forEach((point, i) => {
                const x = waveStartX + (i / wave.length) * waveWidth;
                const amp = point.amplitude * Math.sin(t * point.frequency + point.phase) * 0.5;
                const y = waveY + amp * (0.3 + 0.7 * Math.sin(t * 0.8 + i * 0.1));
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.strokeStyle = `rgba(${COLORS.cyan}, 0.12)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Second waveform layer
            ctx.beginPath();
            wave.forEach((point, i) => {
                const x = waveStartX + (i / wave.length) * waveWidth;
                const amp = point.amplitude * Math.cos(t * point.frequency * 0.7 + point.phase) * 0.4;
                const y = waveY + amp * (0.3 + 0.7 * Math.cos(t * 0.6 + i * 0.15));
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.strokeStyle = `rgba(${COLORS.blue}, 0.08)`;
            ctx.lineWidth = 1;
            ctx.stroke();

            animationRef.current = requestAnimationFrame(draw);
        };

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", handleMouse);
        };
    }, [initNodes]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "auto" }}
        />
    );
};

export default HeroCanvas;
