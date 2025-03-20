import { Context, Devvit, useAsync, useState } from "@devvit/public-api";
import { PixelText } from "../Addons/PixelText.js";
import { Engine } from "../../engine/Engine.js";
import { PostData } from "../SolvePageRouter.js";
import { abbreviateNumber, calculateScore } from "../../utils/utils.js";
import Settings from "../../Settings.json";




function processGuessData(guesses: { [guess: string]: string[] }) {
  const total = Object.keys(guesses).length;
  const groups: Record<number, ScoreGroup> = {};

  // Process guesses and group by score
  Object.entries(guesses).forEach(([username, guessArray]) => {
    if (!guessArray || !guessArray.length) return;

    const sep = guessArray[0].split(',');
    const score = calculateScore(sep);
    
    if (!groups[score]) {
      groups[score] = { count: 0, answers: [] };
    }
    
    groups[score].count++;
    groups[score].answers.push({ username, guessString: guessArray[0] });
  });
  
  // Sort scores in descending order
  const sorted = Object.keys(groups)
    .map(Number)
    .sort((a, b) => b - a);
  
  return { scoreGroups: groups, sortedScores: sorted, totalGuesses: total };
}



interface ScoreGroup {
  count: number;
  answers: Array<{
    username: string;
    guessString: string;
  }>;
}

interface StatsPageProps {
  postData: PostData;
  username: string;
  puzzleName: string;
  onBack: () => void;
}

export const StatsPage = (
  props: StatsPageProps,
  context: Context
): JSX.Element => {

  const { puzzleName,  onBack } = props;
  const engine = new Engine(context);
  const rowCount = 6;

  const rowHeight: Devvit.Blocks.SizeString = `${100 / rowCount}%`;

  const { data, loading } = useAsync<{
    playerCount: number;
    guesses: { [guess: string]: string[] };
    userGuess: string
  }>(async () => {

    const empty = { playerCount: 0, guesses: {} as { [guess: string]: string[] }, userGuess: "" };

    if (!props.username) return empty;

    try {

      const players = await engine.getPlayerCount(props.postData.postId);
      const guessScores = await engine.getGuessScores(props.postData.postId);
      const userGuess = await engine.getGuessScore(props.postData.postId, props.username)

      return {
        playerCount: players,
        guesses : guessScores,
        userGuess: userGuess
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

  
  console.log(data.guesses)

  
  const { scoreGroups, sortedScores, totalGuesses } = processGuessData(data.guesses);

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
        <hstack width={`${percentage}%`} height="100%" backgroundColor="white" />
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
        <PixelText scale={2} color="white">{puzzleName}</PixelText>
        <PixelText scale={1.5} color="white">Statistics</PixelText>
      </vstack>
      
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



