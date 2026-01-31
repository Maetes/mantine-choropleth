import { useLayoutEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ChoroplethDataPoint } from '../types.ts';

type ValueMap = Map<string, number>;

const mapsEqual = (left: ValueMap, right: ValueMap) =>
  left.size === right.size && [...left].every(([key, value]) => right.get(key) === value);

export function useChoroplethAnimation(
  data: ChoroplethDataPoint[],
  animated: boolean,
  animationDuration: number,
  onFrameRef: { current: (() => void) | null }
) {
  const animationRef = useRef<number | null>(null);
  const previousDataRef = useRef<ValueMap>(new Map());
  const targetDataRef = useRef<ValueMap>(new Map());
  const animationProgressRef = useRef(1);

  useLayoutEffect(() => {
    const nextMap = new Map(data.map((d) => [d.id, d.value] as const));
    const reset = (map: ValueMap) => {
      previousDataRef.current = map;
      targetDataRef.current = map;
      animationProgressRef.current = 1;
    };
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (!animated || mapsEqual(targetDataRef.current, nextMap)) {
      reset(nextMap);
      return;
    }

    previousDataRef.current = targetDataRef.current.size
      ? targetDataRef.current
      : nextMap;
    targetDataRef.current = nextMap;
    animationProgressRef.current = 0;
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      animationProgressRef.current = d3.easeCubicOut(progress);
      onFrameRef.current?.();

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        reset(nextMap);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [data, animated, animationDuration, onFrameRef]);

  return { animationProgressRef, previousDataRef };
}
