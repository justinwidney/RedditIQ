import { Devvit, Context, useAsync } from "@devvit/public-api";
import { CustomButton } from "../Addons/CustomButton.js";
import { PixelSymbol } from "../PixelSymbol.js";
import { Engine } from "../../engine/Engine.js";
import { LeaderboardRow } from "./LeaderBoardRow.js";


const Layout = (props : {children: JSX.Element; onClose: () => void }): JSX.Element => (

    <vstack width="100%" height="100%" >
        <spacer height="24px" />
        <hstack width="100%" alignment="middle">
            <spacer width="24px" />
            <PixelSymbol type="Leaderboard" scale={2} color="black" />
            <spacer grow />
            <CustomButton text="close" height="32px" width="32px" onClick={props.onClose} />
            <spacer width="24px" />
        </hstack>
        <spacer height="20px" />
        <hstack grow >
            <spacer width="24px" />
            <zstack alignment="start top" grow>
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
                            {props.children}
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
);



interface LeaderboardPageProps {
    username : string | null;
    onClose: () => void;
}
type ScoreBoardEntry = {
    member: string;
    score: number;
    description?: string | undefined;
}
export const LeaderboardPage = (props: LeaderboardPageProps, context: Context): JSX.Element => {


    const {data, loading} = useAsync<{
        leaderboard: ScoreBoardEntry[];
        user :{
            rank: number;
            score: number;
        }
    }>(async () => {

        try{
            return {
                leaderboard: await Engine.getLeaderboard(),
                user: await Engine.getUserScore(props.username)
            }
        } catch (e) {
            console.error(e);
        }
        return {
            leaderboard: [],
            user: {
                rank: -1,
                score: -1
            }
        }
    });

    if (loading || !data) {
        return <text>Loading...</text>
    }

    const leaderboardRows = data.leaderboard.map((entry, index) => {

        return (
            <LeaderboardRow
                rank={index + 1}
                height="32px"
                name = {entry.member}
                score = {entry.score}
                onHighlight = { () => context.ui.navigateTo('test.com')
            />
        );
        });




}