import { Context, Devvit, useAsync, useState } from "@devvit/public-api";
import { PixelText } from "../Addons/PixelText.js";
import { Engine } from "../../engine/Engine.js";
import { PostId, PuzzlePostData } from "../../types.js";
import { PostData } from "../SolvePageRouter.js";




interface StatsPageProps {
  postData: PostData;
  username: any;
  puzzleName: string;
  playerCount: number;
  scoreBuckets: {
    label: string;
    count: number;
    maxCount: number;
  }[];
  onBack: () => void;
}

export const StatsPage = (
  props: StatsPageProps,
  context: Context
): JSX.Element => {
  const { puzzleName, scoreBuckets, onBack } = props;
  
  // Calculate the maximum width for the progress bars
  const maxBarWidth = 300;



  const service = new Engine(context);


  const { data, loading } = useAsync<{
    playerCount: number;
    guesses: { [guess: string]: string[] };
    userGuess: string
  }>(async () => {

    const empty = { playerCount: 0, guesses: {} as { [guess: string]: string[] }, userGuess: "" };

    if (!props.username) return empty;

    console.log("starting to get data")


    try {

      const players = await service.getPlayerCount(props.postData.postId);
      const guessScores = await service.getGuessScores(props.postData.postId);
      const userGuess = await service.getGuessScore(props.postData.postId, props.username)

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

  

  const playerCount =  data.playerCount 

  console.log(data);

  
  return (
    <vstack width="100%" height="100%" padding="medium" backgroundColor="#2ecc71" alignment="center top" gap="medium">
      {/* Header with puzzle name */}
      <vstack width="100%" alignment="middle center" padding="medium">
        <PixelText scale={2} color="white">{puzzleName}</PixelText>
        <PixelText scale={1.5} color="white">Statistics</PixelText>
      </vstack>
      
      {/* Container for score distribution */}
      <vstack 
        width="80%" 
        padding="large" 
        backgroundColor="white" 
        cornerRadius="medium" 
        border="thick" 
        borderColor="black"
        gap="medium"
        alignment="middle center"
      >
        <PixelText scale={1.5} color="black">Score Distribution</PixelText>
        
        <spacer size="small" />
        
        {/* Score buckets with progress bars */}
        {scoreBuckets.map((bucket, index) => {
          // Calculate the width of this particular progress bar
          const percentage = bucket.count / bucket.maxCount;
          const barWidth = Math.max(10, Math.floor(percentage * maxBarWidth));
          
          return (
            <hstack width="100%" gap="medium" alignment="start middle">
              {/* Label for the score range */}
              <hstack width="80px" alignment="end middle">
                <text>{bucket.label}</text>
              </hstack>
              
              {/* Progress bar container */}
              <hstack width={`${maxBarWidth}px`} height="25px" alignment="start middle">
                <hstack 
                  width={`${barWidth}px`} 
                  height="100%" 
                  backgroundColor="#3498db" 
                  cornerRadius="small"
                  alignment="end middle"
                  padding="xsmall"
                >
                  {barWidth > 30 && (
                    <text size="small" color="white">
                      {bucket.count}
                    </text>
                  )}
                </hstack>
                
                {barWidth <= 30 && (
                  <text size="small" color="black" >
                    {bucket.count}
                  </text>
                )}
              </hstack>
            </hstack>
          );
        })}
      </vstack>
      
      {/* Player count information */}
      <vstack 
        width="80%" 
        padding="large" 
        backgroundColor="white" 
        cornerRadius="medium" 
        border="thick" 
        borderColor="black"
        alignment="middle center"
      >
        <PixelText scale={1.5} color="black">
          {playerCount.toLocaleString()}
        </PixelText>
        <text size="large">players have attempted this puzzle</text>
      </vstack>
      

    </vstack>
  );
};

