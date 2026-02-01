/**
 * useGlowAnimation Hook
 * 
 * Manages glow animation state with CSS keyframe generation.
 */

import { useState, useCallback, useMemo } from 'react';
import { GlowAnimationState, DEFAULT_GLOW_ANIMATION } from '../components/generator/GlowAnimationControls';

export function useGlowAnimation() {
  const [animation, setAnimation] = useState<GlowAnimationState>(DEFAULT_GLOW_ANIMATION);

  const updateAnimation = useCallback((updates: Partial<GlowAnimationState>) => {
    setAnimation(prev => ({ ...prev, ...updates }));
  }, []);

  const resetAnimation = useCallback(() => {
    setAnimation(DEFAULT_GLOW_ANIMATION);
  }, []);

  const togglePlay = useCallback(() => {
    setAnimation(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  // Generate inline style for preview
  const previewStyle = useMemo((): React.CSSProperties => {
    if (!animation.isPlaying || animation.type === 'none') {
      return {};
    }

    const animationName = `glow-${animation.type}`;
    const animationValue = `${animationName} ${animation.duration}s ${animation.easing} infinite ${animation.direction}`;

    return {
      animation: animationValue,
    };
  }, [animation]);

  // Check if animation is active
  const isAnimating = animation.type !== 'none' && animation.isPlaying;

  return {
    animation,
    updateAnimation,
    resetAnimation,
    togglePlay,
    previewStyle,
    isAnimating,
  };
}

export default useGlowAnimation;
