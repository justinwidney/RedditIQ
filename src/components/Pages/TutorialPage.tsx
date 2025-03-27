import { Devvit, Context, useState } from '@devvit/public-api';
import { CustomButton } from '../Addons/CustomButton.js';
import { PixelSymbol } from '../Addons/PixelSymbol.js';
import { PixelText } from '../Addons/PixelText.js';
import Settings from '../../Settings.json';
import { GAME_SVG } from '../../data/svgs.js';

interface TutorialPageProps {
    onClose: (skip:boolean) => void;
}

type GameTutorial = {
    name: string;
    image: string; // SVG image data would go here
    title: string;
    instructions: string[];
}

export const TutorialPage = (props: TutorialPageProps, context: Context): JSX.Element => {
    const [currentGameIndex, setCurrentGameIndex] = useState<number>(0);
    
    // Define tutorials for each game (without full SVG data)
    const gameTutorials: GameTutorial[] = [
        {
            name: "celebGuess",
            image: GAME_SVG.celebGuess, // Placeholder for SVG data
            title: "Celebrity Guess",
            instructions: [
                "Look at the image or the clues given",
                "Type your guess in the text field",
                "Submit your answer before time runs out",
                "Get points for how fast you answer!"
            ]
        },
        {
            name: "trivia",
            image: GAME_SVG.trivia, // Placeholder for SVG data
            title: "Trivia",
            instructions: [
                "Read the question carefully",
                "Select one of the multiple-choice answers",
                "Answer questions before time runs out",
                "Each correct answer earns you points"
            ]
        },
        {
            name: "subredditGuess",
            image: GAME_SVG.subredditGuess, // Placeholder for SVG data
            title: "Subreddit Guess",
            instructions: [
                "Look at the post title and content",
                "Guess which subreddit it came from",
                "Get Hints to help you out each guess",
                "Points are awarded for correct guesses"
            ]
        },
        {
            name: "copyPasta",
            image: GAME_SVG.copyPasta, // Placeholder for SVG data
            title: "Copypasta",
            instructions: [
                "Read the popular internet copypasta",
                "Fill in the missing words",
                "Complete as many as you can before time runs out",
                "Points for each correct word!"
            ]
        },
        {
            name: "upvotes",
            image: GAME_SVG.upvotes, // Placeholder for SVG data
            title: "Upvote Battle",
            instructions: [
                "Choose which post you think has more upvotes",
                "Answer all questions before time runs out",
                "Submit your guesses with a click",
                "Get points for correct guesses"
            ]
        },
        {
            name: "historian",
            image: GAME_SVG.historian, // Placeholder for SVG data
            title: "Reddit Historian",
            instructions: [
                "Read the post titles carefully",
                "Choose the correct year",
                "Three tries to get the correct date",
                "Points for getting within 2 years!"
            ]
        },
    ];

    const handleNext = () => {
        setCurrentGameIndex((prev) => (prev + 1) % gameTutorials.length);
    };

    const handlePrev = () => {
        setCurrentGameIndex((prev) => (prev - 1 + gameTutorials.length) % gameTutorials.length);
    };

    const currentGame = gameTutorials[currentGameIndex];

    const handleSkip = () => {
        props.onClose(false);
    };


    return (
        <vstack width="100%" height="100%" padding="small">
           
            {/* Title Bar */}
            <hstack width="100%" alignment="middle">
                <spacer width="24px" />
                <PixelText > Tutorial </PixelText>
                <spacer grow />
                <CustomButton label="Close" textSize={1} height="32px" width="64px" onClick={handleSkip} />
                <spacer width="24px" />
            </hstack>
            
            <spacer height="20px" />
                
            {/* Content Area */}
            <hstack grow>
                <spacer width="24px" />
                <zstack alignment="start top" grow>
                
                    
                    {/* Content */}
                    <vstack width="100%" height="100%">
                        <hstack grow>
                            <vstack grow backgroundColor="white" padding="medium">
                                <hstack width="100%" alignment="middle center">
                                    <PixelText scale={1.5}>{currentGame.title}</PixelText>
                                </hstack>
                                
                                <spacer height="16px" />
                                
                                {/* Game Image */}
                                <hstack width="100%" height="128px" alignment="middle center" backgroundColor="#f0f0f0" cornerRadius="medium">
                                    <image
                                        imageHeight={64}
                                        imageWidth={128}
                                        width="128px"
                                        height="64px"
                                        url={currentGame.image}
                                    />
                                </hstack>
                                
                                <spacer height="16px" />
                                
                                {/* Instructions */}
                                <vstack width="100%" alignment="start" gap="medium">
                                    <text size="medium" weight="bold">How to Play:</text>
                                    {currentGame.instructions.map((instruction, index) => (
                                        <hstack width="100%" gap="small" alignment="start middle">
                                            <text size="small" weight="bold">{index + 1}.</text>
                                            <text size="small">{instruction}</text>
                                        </hstack>
                                    ))}
                                </vstack>
                                
                                <spacer grow />
                                
                                {/* Navigation Buttons */}
                                <hstack width="100%" alignment="center middle" gap="large">
                                    <CustomButton 
                                        label="Prev" 
                                        textSize={1} 
                                        height="32px" 
                                        width="80px" 
                                        onClick={handlePrev} 
                                    />
                                    <text size="xsmall">
                                        {`${currentGameIndex + 1} of ${gameTutorials.length}`}
                                    </text>
                                    <CustomButton 
                                        label="Next" 
                                        textSize={1} 
                                        height="32px" 
                                        width="80px" 
                                        onClick={handleNext} 
                                    />
                                </hstack>
                            </vstack>
                            <spacer width="4px" />
                        </hstack>
                        <spacer height="4px" />
                    </vstack>
                </zstack>
                <spacer width="24px" />
            </hstack>
            
            <spacer height="20px" />
        </vstack>
    );
};