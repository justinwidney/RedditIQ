import { Context, Devvit, useAsync, useState } from "@devvit/public-api";
import { PixelText } from "../Addons/PixelText.js";
import { Engine } from "../../engine/Engine.js";
import { PostData } from "../SolvePageRouter.js";
import { abbreviateNumber } from "../../utils/utils.js";
import Settings from "../../Settings.json";
import { CustomButton } from "../Addons/CustomButton.js";


interface ScoreGroup {
  count: number;
  answers: Array<{
    username: string;
    guessString: string;
  }>;
}

interface StatsPageProps {
  postData: PostData;
  username: string | null;
  puzzleName: string;
  answer: any;
}

export const StatsPage = (
  props: StatsPageProps,
  context: Context
): JSX.Element => {


  const { puzzleName, answer } = props;


  const engine = new Engine(context);
  const rowCount = 6;
  const rowHeight: Devvit.Blocks.SizeString = `${100 / rowCount}%`;







  function processIQData(IQScores: { [username: string]: number }) {
    const total = Object.keys(IQScores).length;
    const groups: Record<number, ScoreGroup> = {};
   
    // Process IQ scores and group by score value
    Object.entries(IQScores).forEach(([username, score]) => {
      // Skip if no score (should not happen, but just in case)
      if (score === undefined || score === null) return;
      
      // Create group for this score if it doesn't exist
      if (!groups[score]) {
        groups[score] = { count: 0, answers: [] };
      }
      
      // Increment count for this score
      groups[score].count++;
      
      // Add username to this score group
      groups[score].answers.push({ 
        username, 
        guessString: score.toString() // Store the score as string for compatibility
      });
    });
    
    // Sort scores in descending order
    const sorted = Object.keys(groups)
      .map(Number)
      .sort((a, b) => b - a);
   
    return { scoreGroups: groups, sortedScores: sorted, totalGuesses: total };
  }


  const { data, loading } = useAsync<{
    playerCount: number;
    userGuess: string;
    playerIQ: number;
    totalIQ: number;
    IQScores: { [username: string]: number };
  }>(async () => {

    const empty = { playerCount: 0, IQScores: {}, userGuess: "", playerIQ: 0, totalIQ: 0 };

    if (!props.username) return empty;

    try {

      const players = await engine.getPlayerCount(props.postData.postId);
      //const guessScores = await engine.getGuessScores(props.postData.postId);
      const totalIQ = await engine.getTotalIQ(props.username);
      const userGuess = await engine.getGuessScore(props.postData.postId, props.username)
      const playerIQ = await engine.getPostIQ(props.postData.postId, props.username);
      const IQScores = await engine.getAllPostIQ(props.postData.postId)

      return {
        playerCount: players,
        IQScores: IQScores,
        userGuess: userGuess || "",
        playerIQ: playerIQ,
        totalIQ: totalIQ
      };
    } catch (error) {
      if (error) {
        console.error('Error loading drawing meta data', error);
      }
      return empty;
    }
  });

  if(loading || data === null){
    return <>
        Test
    </>
  }

  const submitComment = async () => {

    engine.submitComment(data.playerIQ, data.totalIQ, props.postData.postId)
    context.ui.showToast("Comment Submitted");

  }
  
  const { scoreGroups, sortedScores, totalGuesses } = processIQData(data.IQScores);

  // Create score visualization components
  const topGuesses = sortedScores.map((score, index) => {
    const group = scoreGroups[score];
    const count = group.count;
    const percentage = Math.round((count / totalGuesses) * 100) || 0;
    
    return (
      <zstack
        key={`score-${index}`}
        height={rowHeight}
        width="100%"
        alignment="top start"
        backgroundColor="rgba(255, 255, 255, 0.2)"
      >
        {/* Progress Bar */}
        <hstack width={`${percentage}%`} height="100%" backgroundColor={data.playerIQ === score ? "black" : "white"} />
        {/* Score */}
        <hstack height="100%" width="100%" alignment="start middle">
          <spacer width="12px" />
          <PixelText
            color={Settings.theme.primary}
            scale={2}
          >
            {score.toLocaleString()}
          </PixelText>
        </hstack>
        {/* Metadata */}
        <hstack height="100%" width="100%" alignment="end middle">
          <PixelText scale={1.5} color={Settings.theme.secondary}>
            {count.toString()}
          </PixelText>
          <spacer width="12px" />
          <PixelText scale={2} color={Settings.theme.primary}>
            {`${percentage}%`}
          </PixelText>
          <spacer width="12px" />
        </hstack>
      </zstack>
    );
  });


  const placeholderRows = Array.from({ length: rowCount - 0 }).map(
    (_value, _index) => (
      <zstack height={rowHeight} width="100%" backgroundColor="rgba(255, 255, 255, 0.2)" />
    )
  );


  return (
    <vstack width="100%" height="100%" padding="medium" backgroundColor="#2ecc71" alignment="center top" gap="medium">
      {/* Header with puzzle name */}
      <vstack width="100%" alignment="middle center" padding="medium">
        <PixelText scale={2.5} color="white">REDDIT IQ</PixelText>
        <spacer height="8px" />
        <PixelText scale={3} color={Settings.theme.primary}>{data.totalIQ.toLocaleString()}</PixelText>      
      </vstack>
      
           {/* Player IQ Score */}
          {props.username && data.playerIQ > 0 && (
        <hstack width="100%" alignment="middle center" padding="small" >
            <CustomButton label="Post" onClick={submitComment} />
            <spacer width="16px" />
          <PixelText scale={4} color={Settings.theme.primary}>{data.playerIQ.toLocaleString()}</PixelText>
          <spacer width="22px" />
         
        </hstack>
          )}


        <hstack width="100%" grow>
          <spacer width="24px" />
          <vstack grow gap="small">
            {topGuesses}
            {placeholderRows}
          </vstack>
          <spacer width="24px" />
        </hstack>

        <spacer height="24px" />

        {/* Metadata */}
        <hstack alignment="middle center">
          <PixelText
            scale={1.5}
            color={Settings.theme.secondary}
          >{`${abbreviateNumber(data.playerCount)} player${data.playerCount === 1 ? '' : 's'}`}
          </PixelText>
        </hstack>
    </vstack>
  );
};



