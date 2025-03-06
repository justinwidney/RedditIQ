import { Context, Devvit, useState } from "@devvit/public-api";
import { Engine } from "../../engine/Engine.js";
import { UserData } from "../../types.js";

interface PuzzlePageProps {
    postData: Record<string, any>;
    userData: UserData | null;
    username: string | null;
    gameSettings: Record<string, any> | null;
    puzzle: Record<string, any> | null;
}


export const PuzzlePost = (props: PuzzlePageProps, context: Context): JSX.Element => {

    const gameEngine = new Engine(context)
    const isAuthor = props.postData.authorId === props.username;
    const isSolved = !!props.userData?.solved
    const isSkipped = !!props.userData?.skipped



    const [currentStep, setCurrentStep] = useState<string>(
        isAuthor|| isSolved || isSkipped ? "3" : "1"
    );


    const steps: Record<string, JSX.Element> = {
        "1": <text>Step 1</text>,
        "2": <text>Step 2</text>,
        "3": <text>Step 3</text>,
    }



    return (
        <vstack width="100%" height="100%">

            {steps[currentStep] || <text> Error</text>}

        </vstack>
    )


}
