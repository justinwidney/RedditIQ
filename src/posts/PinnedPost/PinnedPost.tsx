import { Context, useState, Devvit, useAsync } from "@devvit/public-api";
import { TutorialPage } from "../../components/TutorialPage.js";
import { CustomButton } from "../../components/CustomButton.js";
import { PixelSymbol } from "../../components/PixelSymbol.js";
import { SolvePageStep } from "../../components/SolvePage.js";
import { SolvePageRouter } from "../../components/SolvePageRouter.js";
import { GameSettings, UserData } from "../../types.js";

interface PinnedPostProps {
    postData: Record<string, any>;
    userData: UserData | null;
    username: string | null;
    gameSettings: GameSettings;
    puzzle: Record<string, any> | null;
}


export const PinnedPost = (props: PinnedPostProps, context: Context): JSX.Element => {

    const [page, setPage] = useState('menu')


    




    const Menu = (
        <vstack width="100%" height="100%" alignment="center middle">
            <spacer grow />
            <image
                imageHeight={128}
                imageWidth={128}
                width="64px"
                height="64px"
                        url={`data:image/svg+xml,
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 16 16" shape-rendering="crispEdges">
                    <path stroke="#ed1c24" d="M13 0h3M12 1h4M11 2h5M12 3h4M13 4h3M13 5h3M13 6h3M13 7h3M5 8h2M13 8h3M4 9h2M13 9h3M3 10h2M13 10h2M3 11h1M13 11h1M3 12h1M12 12h1" />
                    <path stroke="#000000" d="M5 1h3M4 2h1M8 2h3M5 3h1M11 3h1M4 4h1M6 4h1M12 4h1M3 5h1M12 5h1M2 6h1M8 6h1M12 6h1M2 7h1M5 7h3M12 7h1M3 8h2M7 8h1M12 8h1M6 9h1M12 9h1M5 10h1M12 10h1M4 11h1M11 11h2M4 12h8M3 13h1M12 13h1M3 14h10" />
                    <path stroke="#ccc8cc" d="M5 2h1M5 4h1M4 5h1M3 6h1M3 7h1M8 7h1M8 8h1M7 9h1M6 10h1M5 11h1M4 13h2" />
                    <path stroke="#a3a3a3" d="M6 2h2M6 3h5M7 4h5M5 5h7M4 6h4M9 6h3M4 7h1M9 7h3M9 8h3M8 9h4M7 10h5M6 11h5M6 13h6" />
                </svg>`}
                description="chess paint logo"
                />


            <PixelSymbol type="Title" scale={3} color="#000000" />

            <spacer grow />
            
            <vstack alignment="center middle" gap="small">

            <CustomButton onClick={() => setPage('solve')} text="Solve"  width="256px" height="48px" color="#FFFFFF"/>

            <CustomButton onClick={() => setPage('tutorial')} text="Tutorial"  width="256px" height="48px" color="#FFFFFF"/>

            </vstack>

            <spacer grow />

            </vstack>
    )

    const onClose = ():void => {
        console.log('closing')
        setPage('menu')
    }


    const pages: Record<string, JSX.Element> = {
        menu: Menu,
        tutorial : <TutorialPage onClose={onClose} />,
        solve: <SolvePageRouter {...props} onCancel={onClose}/>
    }



    return pages[page] || Menu

}