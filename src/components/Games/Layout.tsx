import { Devvit } from "@devvit/public-api";
import { PixelSymbol } from "../PixelSymbol.js";
import { CustomButton } from "../Addons/CustomButton.js";


export type GameChildProps ={
    
}


export const Layout = (props : {children: JSX.Element; onClose: () => void }): JSX.Element => (

    <vstack width="100%" height="100%" >
        <spacer height="24px" />
        <hstack width="100%" alignment="middle">
            <spacer width="24px" />
            <PixelSymbol type="Leaderboard" scale={2} color="black" />
            <spacer grow />
            <CustomButton label="close" height="32px" width="32px" onClick={props.onClose} />
            <spacer width="24px" />
        </hstack>
        <spacer height="20px" />

        <vstack grow >

            {props.children}

        </vstack>



        <spacer height="20px" />
    </vstack>
);
