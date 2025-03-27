import { Context, Devvit, useInterval, useState } from "@devvit/public-api";

import Settings from '../Settings.json';
import { PixelText } from "./Addons/PixelText.js";

interface IQScoreOverlayProps {
  initialIQ: number; 
  newIQ?: number;
  isVisible: boolean;
  onAnimationComplete?: () => void;
  onTap?: () => void;
}


export const IQScoreOverlay = (
  props: IQScoreOverlayProps,
  context: Context
): JSX.Element => {
  const { initialIQ, newIQ, isVisible, onAnimationComplete, onTap } = props;
  
  // State for animation
  const [displayIQ, setDisplayIQ] = useState(initialIQ);
  const [animationState, setAnimationState] = useState<'idle' | 'animating' | 'complete'>('idle');
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down' | 'none' | 'same'>('none');
  const [animationStep, setAnimationStep] = useState(0);
  
  const INITIAL_PAUSE = 800; 
  const TICK_INTERVAL = 50;  
  const TOTAL_PAUSE_INTERVALS = INITIAL_PAUSE / 100; 
  
  // Determine if animation should start
  useInterval(() => {

    if (newIQ !== undefined && animationState === 'idle' && isVisible) {
      setAnimationState('animating');
    
      if (newIQ > initialIQ) {
        setAnimationDirection('up');
      } else if (newIQ < initialIQ) {
        setAnimationDirection('down');
      } else {
        setAnimationDirection('same');
      }

      setAnimationStep(0);
    }


  }, 100).start();
  
  // Handle the animation sequence
  useInterval(() => {
    if (animationState !== 'animating' || !isVisible) return;
    
    // Step 1: Initial pause before animation starts
    if (animationStep < TOTAL_PAUSE_INTERVALS) {
      setAnimationStep(animationStep + 1);
      return;
    }
    
    // Step 2: Animate the score change
    const targetIQ = newIQ !== undefined ? newIQ : initialIQ;
    const increment = animationDirection === 'up' ? 1 : -1;
    
    if ((animationDirection === 'up' && displayIQ < targetIQ) || 
        (animationDirection === 'down' && displayIQ > targetIQ)) {
      setDisplayIQ(displayIQ + increment);
    } else {
      // Animation complete
      setAnimationState('complete');
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }
  }, TICK_INTERVAL).start();
  
  // Reset when overlay becomes invisible
  useInterval(() => {
    if (!isVisible && animationState !== 'idle') {
      setAnimationState('idle');
      setAnimationDirection('none');
      setDisplayIQ(initialIQ);
    }
  }, 100).start();
  
  if (!isVisible) return <></>;
  
  // Handle tap on the component
  const handlePress = () => {
    if (animationState === 'complete' && onTap) {
      onTap();
    }
  };
  
  return (
    <zstack width="100%" height="100%">
      {/* Dark overlay background */}
      <hstack width="100%" height="100%" backgroundColor="rgba(0, 0, 0, 0.85)" onPress={handlePress} />
      
      <vstack width="100%" height="100%" alignment="middle center" onPress={handlePress}>
        <spacer size="large" />
        
        <vstack gap="medium" alignment="middle center">
          <PixelText scale={3}>CURRENT IQ</PixelText>
          
          <hstack alignment="middle center" gap="small">
            <vstack 
              alignment="middle center"
              backgroundColor={Settings.theme.primary}
              padding="large"
              cornerRadius="large"
              width="100%"
              height="100%"
            >
              <PixelText scale={6} color="white">{displayIQ.toLocaleString()}</PixelText>
            </vstack>
            
            {animationState === 'animating' && animationDirection === 'up' && (
              <text 
                color="green"
                size="xxlarge"
                weight="bold"
              >
                ↑
              </text>
            )}
            
            {animationState === 'animating' && animationDirection === 'down' && (
              <text 
                color="red"
                size="xxlarge"
                weight="bold"
              >
                ↓
              </text>
            )}
            
            {animationState === 'animating' && animationDirection === 'same' && (
              <text 
                color="yellow"
                size="xxlarge"
                weight="bold"
              >
                =
              </text>
            )}
          </hstack>
          
          {animationState === 'animating' && animationDirection === 'up' && (
            <PixelText scale={2} color="green">BIG BRAIN ACTIVATED!</PixelText>
          )}
          
          {animationState === 'animating' && animationDirection === 'down' && (
            <PixelText scale={2} color="red">NOW A VERIFIED R/SHOWERTHOUGHTS CONTRIBUTOR!</PixelText>
          )}

            {animationState === 'animating' && animationDirection === 'same' && (
            <PixelText scale={2} color="yellow">BRAIN STATUS: CRUISE CONTROL.</PixelText>
          )}
          
          {animationState === 'complete' && (
            <PixelText scale={2} color="white">TAP TO CONTINUE</PixelText>
          )}
        </vstack>
      </vstack>
    </zstack>
  );
}