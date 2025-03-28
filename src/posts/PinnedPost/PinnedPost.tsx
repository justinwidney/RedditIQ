import { Context, useState, Devvit, useAsync } from "@devvit/public-api";
import { TutorialPage } from "../../components/Pages/TutorialPage.js";
import { CustomButton } from "../../components/Addons/CustomButton.js";

import { SolvePageRouter } from "../../components/SolvePageRouter.js";
import { GameSettings, PostId, PuzzlePostData, UserData } from "../../types.js";
import { Engine } from "../../engine/Engine.js";
import { StatsPage } from "../../components/Pages/ScorePage.js";
import { PixelText } from "../../components/Addons/PixelText.js";
import { LoadingState } from "../../components/Addons/LoadingState.js";
import { renderHintHearts, renderHintHearts2 } from "../../components/Addons/Hearts.js";
import { Shadow } from "../../components/Addons/Shadow.js";
import { Row } from "./Row.js";
import { Quad } from "./Quad.js";




async function loadQuestionsFromPath(title: string) { 
  return (await import(`../../data/Questions/${title}.json`)).default;
}

type PostData = {
    postId: PostId;
    postType: string;
  };
  
interface PinnedPostProps {
    postData: PostData
    userData: UserData | null;
    username: string | null;
    postSettings?: GameSettings;
}


function createComponentIndexArray(questionsData) {
  // Define your component order/mapping
  const componentTypes = [
    'celebGuess',    // index 0
    'trivia',        // index 1
    'subredditGuess', // index 2
    'copyPasta',     // index 3
    'upvotes',       // index 4
    'historian'      // index 5
  ];
  
  // Map of question types to component indices
  const typeToIndexMap = {
    'celebrity': 0,     // celebGuess
    'trivia': 1,        // trivia
    'subreddit': 2,     // subredditGuess
    'pasta': 3,         // copyPasta
    'upvotes': 4,       // upvotes
    'historian': 5      // historian
  };
  
  // Extract the question types from the JSON
  const questionTypes = questionsData.map(question => question.type);
  
  // Convert each question type to its corresponding component index
  const indexArray = questionTypes.map(type => typeToIndexMap[type]);
  
  return indexArray;
}

const AVERAGE_IQ = (Math.floor(Math.random() * (120 - 80 + 1) + 80)).toLocaleString()

export const  PinnedPost = (props: PinnedPostProps, context: Context): JSX.Element => {

    const engine = new Engine(context);
    const isSolved = !!props.userData?.solved;

    const dimensions = context.dimensions || { width: 700, height: 500 }; 

    const extraPadding = dimensions.width > 450 

    const [data] = useState( 
      async () => {
        return context.cache(
          async () => {
            const json = await loadQuestionsFromPath(props.postSettings?.title || "");

        return await json
      },
        {
          key: context.postId!,
          ttl: 2 * 60 * 60 * 5000 
        }
        )
      });


      const { data:player, loading} = useAsync<{
        playerCount: number;

      }>(async () => {
        const players = await engine.getPlayerCount(props.postData.postId);
        return {
          playerCount: players ? players : 0,
        }
      });


    

    const questions = data?.questions  ? createComponentIndexArray(data.questions) : [0, 1, 2, 3, 4, 5]
    
   const templateQuestions = data?.templateQuestions || [];

    const [page, setPage] = useState(
       isSolved ? 'score' : 'menu'
    );

    const Title = props.postSettings?.title || "Puzzle";
     

    const Menu = (
        <vstack width="100%" height="100%" alignment="top center" >

            <hstack width="90%" padding="medium" gap="small" alignment="middle center">

              <CustomButton onClick={() => setPage('tutorial')} label="Games"  width="122px" height="52px" color="white" textSize={2}/>

              <spacer grow />

              <image

                  imageHeight={150}
                  imageWidth={300}
                  width={extraPadding ? "200px" : "250px"}
                  height="100px"
                          url={`logo.gif`}
                  description="Reddit IQ Logo"
                  />
                  
              <spacer grow />
              <hstack width="122px" height="52px" gap="small" backgroundColor="#013839" alignment="center middle" cornerRadius="medium">
              {renderHintHearts2(0)}
              </hstack>

            </hstack>

            <Quad templateQuestions = {templateQuestions} />


            <spacer grow />

            <vstack alignment="center middle" gap="small" onPress={() => setPage('solve')}>

            <image
                  imageHeight={52}
                  imageWidth={152}
                  width={"152px"}   
                  height={"52px"}
                          url={'button.gif'}
                  description="Title Field"
                  />

            </vstack>

     

          <spacer size="small" />

          

            

            <spacer size="large" />

            </vstack>
    )

       

    const onClose = (skip:boolean = false) :void => {
        setPage(  skip? 'score' : 'menu')
    }

    const pages: Record<string, JSX.Element> = {
        menu: Menu,
        tutorial : <TutorialPage onClose={onClose} />,
        solve: <SolvePageRouter {...props} onCancel={onClose} questions={questions} questionData={data.questions} />,
        score: <StatsPage puzzleName={Title} {...props}  />
    }



    return pages[page] || Menu;

}