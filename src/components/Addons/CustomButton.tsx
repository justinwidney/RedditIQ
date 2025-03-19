import { Devvit } from "@devvit/public-api";
import { PixelSymbol, SupportedSymbols } from "./PixelSymbol.js";
import Settings  from "../../Settings.json"
import { PixelText } from "./PixelText.js";


const styles = {
    primary: {  
        backgroundColor: '#FF0000',
        borderColor: '#FF0000',
        color: '#FFFFFF',
    },
    secondary: {
        backgroundColor: '#00FF00',
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

}




export const CustomButton = (props: ButtonProps): JSX.Element => {

    const {textSize, label, onClick, width = 20, height = 20, color, icon, appearance} = props;
    const style = styles[appearance || 'primary']



    return (
        <hstack width={width}  height={height } alignment="center middle" gap="small" onPress={onClick} backgroundColor={style.borderColor}>
            <hstack width="100%" height="100%" alignment="center middle" backgroundColor={Settings.theme.primary} padding="small" >

                {icon ? <image url="background.png" imageHeight={30} imageWidth={30}  /> : null }
                {label ? <PixelText scale={textSize} color="#000000">{label}</PixelText> : null}

        </hstack>
        </hstack>   

    )
    
}