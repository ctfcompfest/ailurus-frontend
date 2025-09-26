"use client";

import { useEffect, useMemo, useRef } from "react";
import { AttackMarker } from "./interface";
import { getCoordinates, generateControlPoints } from "./utils";

interface AttackMarkerPanelProps {
  markerData: AttackMarker[];
  teamLen: number;
  onMarkerDone?: () => void;
  onBatchDone?: (count: number) => void;
  shotSfxUrl?: string;
  impactSfxUrl?: string;
  onShot?: (marker: AttackMarker) => void;
  onImpact?: (marker: AttackMarker) => void;
}

type Slot = {
  beam?: SVGPathElement;
  bullet?: SVGCircleElement;
  busy: boolean;
};

const POOL_SIZE = 24;
const BEAM_MS = 300;
const BULLET_MS = 700;
const FADE_MS = 150;

//used to precompute path (the actual html node element) so that we don;t have to rerender the html tree everytime
function buildPathFactory(teamLen: number) {
  return (attackerId: number, defenderId: number) => {
    const { posX: ax, posY: ay } = getCoordinates(attackerId, teamLen);
    const { posX: dx, posY: dy } = getCoordinates(defenderId, teamLen);
    const P0 = { x: ax + 50, y: ay + 17 };
    const P3 = { x: dx + 50, y: dy + 17 };
    const { P1, P2 } = generateControlPoints(P0, P3);
    return `M ${P0.x},${P0.y} C ${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`;
  };
}

function setupBeam(beam: SVGPathElement, color: string, pathD: string) {
  beam.setAttribute("d", pathD);
  beam.style.stroke = color;
  beam.style.strokeWidth = "2.5";
  beam.style.fill = "none";
  beam.style.filter = "url(#laser-glow)";
  const len = beam.getTotalLength();
  beam.style.strokeDasharray = `${len}`;
  beam.style.strokeDashoffset = `${len}`;
  return len;
}

function setupBullet(bullet: SVGCircleElement, color: string, pathD: string) {
  bullet.setAttribute("r", "4");
  bullet.style.fill = color;
  bullet.style.filter = "url(#laser-glow)";
  (bullet.style as any).offsetPath = `path('${pathD}')`;
  (bullet.style as any).offsetRotate = "0deg";
}

function animateBeamDraw(beam: SVGPathElement, len: number) {
  return beam.animate(
    [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
    { duration: BEAM_MS, easing: "linear", fill: "forwards" }
  );
}

function animateBulletTravel(bullet: SVGCircleElement) {
  return bullet.animate(
    [{ offsetDistance: "0%" }, { offsetDistance: "100%" }],
    { duration: BULLET_MS, easing: "linear", fill: "forwards" }
  );
}

function fadeOut(el: Element) {
  return (el as HTMLElement).animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: FADE_MS, fill: "forwards" }
  );
}

export function AttackMarkerPanel({
  markerData,
  teamLen,
  onMarkerDone,
  onBatchDone,
  shotSfxUrl,
  impactSfxUrl,
  onShot,
  onImpact,
}: AttackMarkerPanelProps) {
  const slotsRef = useRef<Slot[]>(Array.from({ length: POOL_SIZE }, () => ({ busy: false })));
  const animsRef = useRef<Animation[]>([]);
  const lastIdxRef = useRef(0);
  const pendingRef = useRef<AttackMarker[]>([]);
  const batchesRef = useRef<{ count: number; remaining: number }[]>([]);
  const pumpingRef = useRef(false);

  const getPathD = useMemo(() => buildPathFactory(teamLen), [teamLen]);

  const acquireSlot = () => {
    const slots = slotsRef.current;
    for (let i = 0; i < slots.length; i++) {
      if (!slots[i].busy && slots[i].beam && slots[i].bullet) {
        slots[i].busy = true;
        return i;
      }
    }
    return -1;
  };

  const freeSlot = (idx: number) => {
    const s = slotsRef.current[idx];
    s.busy = false;
    if (s.beam) {
      s.beam.style.opacity = "1";
      s.beam.style.strokeDasharray = "";
      s.beam.style.strokeDashoffset = "";
    }
    if (s.bullet) {
      (s.bullet.style as any).offsetPath = "";
      (s.bullet.style as any).offsetDistance = "";
    }
  };

  const pump = () => {
    if (pumpingRef.current) return;
    pumpingRef.current = true;

    const run = () => {
      let didWork = false;
      while (pendingRef.current.length) {
        const slotIdx = acquireSlot();
        if (slotIdx === -1) break;
        didWork = true;

        const job = pendingRef.current.shift()!;
        const pathD = getPathD(job.attackerId, job.defenderId);
        const slot = slotsRef.current[slotIdx]!;
        const beam = slot.beam!;
        const bullet = slot.bullet!;

        const len = setupBeam(beam, job.color, pathD);
        setupBullet(bullet, job.color, pathD);

        const a1 = animateBeamDraw(beam, len);
        const a2 = animateBulletTravel(bullet);
        animsRef.current.push(a1, a2);

        // fire sfx
        onShot?.(job);
        try {
          if (shotSfxUrl) {
            const audio = new Audio(shotSfxUrl);
            audio.play().catch((err) => { console.error(err) });
          }
        } catch { }

        const onDone = () => {
          // impact sfx
          onImpact?.(job);
          try {
            if (impactSfxUrl) {
              const audio = new Audio(impactSfxUrl);
              audio.play().catch(() => { });
            }
          } catch { }

          const fade = fadeOut(beam);
          animsRef.current.push(fade);
          fade.onfinish = () => {
            freeSlot(slotIdx);
            if (batchesRef.current.length) {
              const head = batchesRef.current[0];
              head.remaining -= 1;
              if (head.remaining === 0) {
                const finished = batchesRef.current.shift()!;
                if (onBatchDone) onBatchDone(finished.count);
                else if (onMarkerDone) for (let i = 0; i < finished.count; i++) onMarkerDone();
              }
            }
            run();
          };
        };

        let remaining = 2;
        const step = () => {
          remaining -= 1;
          if (remaining === 0) onDone();
        };
        a1.onfinish = step;
        a2.onfinish = step;
      }

      if (!didWork && pendingRef.current.length) setTimeout(run, 16);
      else pumpingRef.current = false;
    };

    run();
  };

  useEffect(() => {
    if (markerData.length < lastIdxRef.current) {
      lastIdxRef.current = markerData.length;
      return;
    }
    const delta = markerData.length - lastIdxRef.current;
    if (delta <= 0) return;

    const newItems = markerData.slice(lastIdxRef.current);
    lastIdxRef.current = markerData.length;
    pendingRef.current.push(...newItems);
    batchesRef.current.push({ count: newItems.length, remaining: newItems.length });
    pump();
  }, [markerData.length]);

  // useEffect(() => {
  //   return () => {
  //     animsRef.current.forEach((a) => a.cancel());
  //     animsRef.current = [];
  //   };
  // }, []);

  return (
    <g>
      <defs>
        <filter id="laser-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <g key={i} data-slot={i}>
          <path
            data-role="beam"
            ref={(el) => {
              if (el) slotsRef.current[i].beam = el;
            }}
          />
          <circle
            data-role="bullet"
            ref={(el) => {
              if (el) slotsRef.current[i].bullet = el;
            }}
          />
        </g>
      ))}
    </g>
  );
}
