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

    const {textSize, label, onClick, width = 20, height = 20, color, icon, appearance} = props;
    const style = styles[appearance || 'primary']
    const [increasing, setIncreasing] = useState(true);
    const [scale, setScale] = useState(1);




    return (
        <hstack width={width}  height={height} alignment="center middle" padding="xsmall" onPress={onClick} backgroundColor={"#013839"} cornerRadius="medium" >

                {icon ? <image url="background.png" imageHeight={30} imageWidth={30}  /> : null }
                {label ? <PixelText scale={textSize} color={color}>{label}</PixelText> : null}

            </hstack>   

    )
    
}