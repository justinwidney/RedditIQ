import { Devvit, useInterval, useState } from "@devvit/public-api";
import { PixelSymbol, SupportedSymbols } from "./PixelSymbol.js";
import Settings  from "../../Settings.json"
import { PixelText } from "./PixelText.js";
import { Shadow } from "./Shadow.js";


const styles = {
    primary: {  
        backgroundColor: '#24610A',
        borderColor: '#013839',
        color: '#FFFFFF',
    },
    secondary: {
        backgroundColor: '#898989',
        borderColor: '#00FF00',
        color: '#FFFFFF',
    },
    tertiary: {
        backgroundColor: '#0000FF',
        borderColor: '#0000FF',
        color: '#FFFFFF',
    }
}



interface ButtonProps {
    textSize?: number;
    onClick: () => void;
    width?: Devvit.Blocks.SizeString;
    height?:  Devvit.Blocks.SizeString;
    color?: string;
    icon?: string;
    appearance?: 'primary' | 'secondary' | 'tertiary';
    label?: string;
    animating?: boolean;

}

const ANIMATION_INTERVAL = 250


export const CustomButton = (props: ButtonProps): JSX.Element => {

    const {textSize, label, onClick, width = 20, height = 20, color, icon, appearance, animating = false} = props;
    const style = styles[appearance || 'primary']
    const [increasing, setIncreasing] = useState(true);
    const [scale, setScale] = useState(1);


    const newWidth = animating  ? `${160 * scale}px` as Devvit.Blocks.SizeString : width;
    const newHeight = animating ? `${60 * scale}px` as Devvit.Blocks.SizeString : height;

    const pulseTimer = useInterval(() => {
        if (increasing) {
          setScale(prev => {
            if (prev >= 1.15) {
              setIncreasing(false);
              return 1.15;
            }
            return prev + 0.01;
          });
        } else {
          setScale(prev => {
            if (prev <= 1) {
              setIncreasing(true);
              return 1;
            }
            return prev - 0.01;
          });
        }
      }, 50);

      if (!animating) {
        pulseTimer.stop();
      } else {
        pulseTimer.start();
        }


    return (
        <Shadow height={newHeight} width={newWidth}>
        <hstack width={newWidth}  height={newHeight} alignment="center middle" padding="xsmall" onPress={onClick} backgroundColor={style.backgroundColor}>
            <hstack width="100%" height="100%" alignment="center middle" backgroundColor={style.backgroundColor} padding="small" >

                {icon ? <image url="background.png" imageHeight={30} imageWidth={30}  /> : null }
                {label ? <PixelText scale={textSize} color={color}>{label}</PixelText> : null}

                </hstack>
            </hstack>   
        </Shadow>

    )
    
}