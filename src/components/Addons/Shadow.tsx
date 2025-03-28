import { Devvit } from '@devvit/public-api';
import Settings from '../settings.json';

interface ShadowProps {
  height: Devvit.Blocks.SizeString;
  width: Devvit.Blocks.SizeString;
  children: JSX.Element;
  onPress?: () => void;
}

export const Shadow = (props: ShadowProps): JSX.Element => {
  const { height, width, children, onPress } = props;
  return (
    <vstack 
      height={height} 
      width={width} 
      backgroundColor="#E8E8E8" 
      onPress={onPress}
    >
      {/* Inner shadow effect */}
      <zstack alignment="start top" width="100%" height="100%">
        {/* Content container */}
        <vstack width="100%" height="100%">
          {children}
        </vstack>
        
        {/* Top and left shadow */}
        <hstack width="100%" height="4px" backgroundColor="rgba(0,0,0,0.25)" />
        <vstack width="4px" height="100%" backgroundColor="rgba(0,0,0,0.25)" />
        
        {/* Alternative approach with absolute positioned elements if needed */}
        {/* You can adjust the opacity values (0.2) to control shadow intensity */}
      </zstack>
    </vstack>
  );
};
