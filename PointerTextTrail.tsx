"use client";
import { useEffect, useRef } from "react";

const TEXT = "TACXM";
const BASE_FONT_SIZE = 21;
const ROTATE_SPEED = 0.01;
const SMOOTHING = 0.15;
const RT_SMOOTHING = 0.3;
const RAINBOW_SPEED = 0.01;

export default function PointerTextTrail() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const charsRef = useRef<HTMLDivElement[]>([]);
  const circleRef = useRef<HTMLDivElement | null>(null);

  let mouseX = 0;
  let mouseY = 0;
  let isRotate = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let angle = 0;

  const lerp = (a: number, b: number, t: number) =>
    a * (1 - t) + b * t;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    charsRef.current = [];

    for (let i = 0; i < TEXT.length; i++) {
      const el = document.createElement("div");
      el.textContent = TEXT[i];
      el.style.position = "absolute";
      el.style.fontSize = `${BASE_FONT_SIZE}px`;
      el.style.fontWeight = "bold";
      el.style.transform = "translate(-50%, -50%)";
      el.style.pointerEvents = "none";
      el.dataset.x = String(window.innerWidth);
      el.dataset.y = String(window.innerHeight);
      el.style.left = `${window.innerWidth}px`;
      el.style.top = `${window.innerHeight}px`;
      el.style.color = "black";

      container.appendChild(el);
      charsRef.current.push(el);
    }

    const circle = document.createElement("div");
    circle.style.position = "absolute";
    circle.style.transform = "translate(-50%, -50%)";
    circle.style.pointerEvents = "none";
    circle.style.display = "none";
    circle.style.width = "110px";
    circle.style.height = "110px";

    const ring = document.createElement("div");
    ring.style.position = "absolute";
    ring.style.inset = "0";
    ring.style.border = "1px solid #ffffff4d";
    ring.style.borderRadius = "50%";
    circle.appendChild(ring);

    const star = document.createElement("div");
    star.style.position = "absolute";
    star.style.transform = "rotate(17deg)";
    star.style.inset = "0";
    circle.appendChild(star);

    const lines: HTMLDivElement[] = [];
    for (let i = 0; i < 5; i++) {
      const line = document.createElement("div");
      line.style.position = "absolute";
      line.style.height = "1px";
      line.style.background = "#ffffff4d";
      line.style.transformOrigin = "0 0";
      star.appendChild(line);
      lines.push(line);
    }

    container.appendChild(circle);
    circleRef.current = circle;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (timer) clearTimeout(timer);
      isRotate = false;
      timer = setTimeout(() => (isRotate = true), 500);
    };

    const onLeave = () => {
      mouseX = window.innerWidth;
      mouseY = window.innerHeight;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const update = () => {
      const circle = circleRef.current;

      if (circle) {
        if (isRotate) {
          circle.style.display = "block";
          circle.style.left = `${mouseX}px`;
          circle.style.top = `${mouseY}px`;
          circle.style.transform = `translate(-50%, -50%)`;
        } else {
          circle.style.display = "none";
        }
      }

      if (isRotate && circle) {
        angle += ROTATE_SPEED;

        const size = 53;
        const cx = 55;
        const cy = 55;

        const pts = [];

        for (let i = 0; i < 5; i++) {
          const a =
            (i / 5) * Math.PI * 2 -
            Math.PI / 2 +
            angle;

          pts.push({
            x: cx + Math.cos(a) * size,
            y: cy + Math.sin(a) * size,
          });
        }

       
        const order = [0, 2, 4, 1, 3, 0];

        for (let i = 0; i < 5; i++) {
          const a = pts[order[i]];
          const b = pts[order[i + 1]];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const rot = Math.atan2(dy, dx) * 180 / Math.PI;

          const line = lines[i];
          line.style.left = `${a.x}px`;
          line.style.top = `${a.y}px`;
          line.style.width = `${len}px`;
          line.style.transform = `rotate(${rot}deg)`;
        }
      }

      if (isRotate) {
        charsRef.current.forEach((char, i) => {
          const cx = parseFloat(char.dataset.x || "0");
          const cy = parseFloat(char.dataset.y || "0");

          const a = (i / TEXT.length) * Math.PI * 2 + angle;
          const radius = 55;

          const tx = mouseX + Math.cos(a) * radius;
          const ty = mouseY + Math.sin(a) * radius;

          const nx = lerp(cx, tx, RT_SMOOTHING);
          const ny = lerp(cy, ty, RT_SMOOTHING);

          char.dataset.x = String(nx);
          char.dataset.y = String(ny);

          char.style.left = `${nx}px`;
          char.style.top = `${ny}px`;
          char.style.transform =
            `translate(-50%, -50%) rotate(${(a * 180) / Math.PI + 90}deg)`;

          char.style.color = "white";
        });
      } else {
        let tx = mouseX;
        let ty = mouseY;

        charsRef.current.forEach((char, i) => {
          const cx = parseFloat(char.dataset.x || "0");
          const cy = parseFloat(char.dataset.y || "0");

          const nx = lerp(cx, tx, SMOOTHING);
          const ny = lerp(cy, ty, SMOOTHING);

          char.dataset.x = String(nx);
          char.dataset.y = String(ny);

          char.style.left = `${nx}px`;
          char.style.top = `${ny}px`;

          let rot = 0;
          if (i === 0) {
            rot =
              (Math.atan2(ty - cy, tx - cx) * 180) / Math.PI + 90;
          } else {
            const prev = charsRef.current[i - 1];
            const px = parseFloat(prev.dataset.x || "0");
            const py = parseFloat(prev.dataset.y || "0");

            rot =
              (Math.atan2(ny - py, nx - px) * 180) / Math.PI + 90;
          }

          char.style.transform =
            `translate(-50%, -50%) rotate(${rot}deg)`;

          tx = nx;
          ty = ny;
        });
      }

      requestAnimationFrame(update);
    };

    update();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none"
    />
  );
}