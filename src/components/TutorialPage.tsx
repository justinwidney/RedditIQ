
import { Devvit, Context } from '@devvit/public-api';

interface TutorialPageProps {
    onClose: () => void;
}


export const TutorialPage = (props: TutorialPageProps, context: Context): JSX.Element => (
    <zstack width="100%" height="100%" alignment="top start">
        <hstack grow>
            <text> Tutorial Page </text>
        </hstack>
        </zstack>
)