
import { Devvit, Context } from '@devvit/public-api';
import { CustomButton } from './CustomButton.js';
import { PixelSymbol } from './PixelSymbol.js';

interface TutorialPageProps {
    onClose: () => void;
}


export const TutorialPage = (props: TutorialPageProps, context: Context): JSX.Element => (
    <vstack width="100%" height="100%" >

        <spacer height="24px" />
        
        { /* Title */}

        <hstack width="100%" alignment="middle">

            <spacer width="24px" />
             <PixelSymbol type="Tutorial" scale={2} color="black" />
            <spacer grow />

            <CustomButton text="close" height="32px" width="32px" onClick={props.onClose} />
            <spacer width="24px" />

        </hstack>

        <spacer height="20px" />

            { /* Body */}
        <hstack grow > 
            <spacer width="24px" />
                <zstack alignment="start top" grow>
                    {/* Shadow */}
                    <vstack width="100%" height="100%">
                    <spacer height="4px" />
                    <hstack grow>
                        <spacer width="4px" />
                        <hstack grow backgroundColor="#000000" />
                    </hstack>
                    </vstack>

                <vstack width="100%" height="100%">
                <hstack grow>
                    <vstack grow backgroundColor="white">
                    <spacer height="4px" />
                    <vstack grow alignment="center middle">
                       <text size="large">How to play</text>    
                        <spacer height="4px" />
                        <text size="large">How to play</text>    
                        <spacer height="16px" />
                        <text size="large">How to play</text>    
                        <spacer height="4px" />
                        <text size="large">How to play</text>    
                    </vstack>
                    <spacer height="4px" />
                    </vstack>
                    <spacer width="4px" />
                </hstack>
                <spacer height="4px" />
                </vstack>
            </zstack>
            <spacer width="20px" />
        </hstack>
        <spacer height="20px" />

        </vstack>
)