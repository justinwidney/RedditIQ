import { Context, Devvit, JSONObject, useState, TextAreaWidget, useForm } from "@devvit/public-api";
import { GameProps, SubredditQuestion, UserData } from "../../types.js";
import { CustomButton } from "../Addons/CustomButton.js";
import { PixelText } from "../Addons/PixelText.js";
import { PixelSymbol } from "../Addons/PixelSymbol.js";
import Settings from "../../Settings.json"
import { PieceSymbol } from "../Addons/PieceSymbol.js";
import { GAME_SVG } from "../../data/svgs.js";



interface SubredditGuessPageProps extends GameProps {
  question: SubredditQuestion;
}


const INITIAL_MAX_HINTS = 3;

const myForm = Devvit.createForm(
    {
      fields: [
        {
          type: 'paragraph', // This creates a multi-line text input
          name: 'userText',
          label: 'Enter your text:',
        },
      ],
    },
    (event, context) => {
      context.ui.showToast({ text: `Submitted: ${event.values.userText}` });
    }
  );
  


export const SubredditGuessPage = (
  props: SubredditGuessPageProps,
  context: Context
): JSX.Element => {
  const { onComplete, onCancel, userData, setScore, setUserGuess, question, userGuess } = props;

  const {ui, reddit} = context;

  const containerWidth = context.dimensions.width > 600 ? '450px' : '300px';
  const pictureWidth = context.dimensions.width > 600 ? '400px' : '250px';
  const textSize = context.dimensions.width > 600 ? 1.5 : 1;
  
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const currentQuestion = question


  const onFinish = (sovled:boolean) => {

    const score = 3 - hintIndex;
    const guess = sovled ? '3' : '0';

    setUserGuess(prevState => [...prevState, guess])
    setScore(prevScore => prevScore + score);
    onComplete(userGuess);

  }


// Handle selecting an option for a blank
const handleOptionSelect = (option : string ) => {

    setHintIndex( prev => prev + 1);


    // Clean up and normalize the input for comparison
    const cleanedInput = option.trim().toLowerCase();
    const cleanedAnswer = currentQuestion.answer.toLowerCase();
    
    // Check if the answer is correct
    const correct = cleanedInput === cleanedAnswer || 
                  `r/${cleanedInput}` === cleanedAnswer || 
                  cleanedInput === `r/${cleanedAnswer}`;
    
    setIsCorrect(correct);
    
    if (correct) {
      onFinish(true);
      return
    }

    if (hintIndex >= INITIAL_MAX_HINTS -1) {
      onFinish(false);
      return
    }

    
    setShowResult(true);
   
};

  const myForm = useForm(
    () => {
      return {
        fields: [
          {
            type: 'string',
            name: 'answer',
            label: `Pick an option 'r/' `,
          },
        ],
   
      } 
    },
    (values) => {
      handleOptionSelect(values.answer);
    }
  );

  const renderHintHearts = () => {
    const hearts = [];
    for (let i = INITIAL_MAX_HINTS - 1; i >= 0; i--) {
      if (hintIndex <= i) {
        hearts.push(
          <PieceSymbol 
            type="heart" 
            color="red" 
            scale={0.5} 
          />
        );
      }
    }
    return hearts;
  };



  return (
    <vstack width="100%" height="100%" padding="small" backgroundColor="#e74c3c" alignment="center">
      <hstack width="100%" alignment="middle center">
        
      <image
                imageHeight={64}
                imageWidth={128}
                width="256px"
                height="144px"
                        url={GAME_SVG.subredditGuess}
                description="subreddit Guess logo"
                />

      </hstack>
      
    
      
      <vstack alignment="middle center" width={containerWidth}>
        
        <vstack width="100%" height="100%" border="thick" borderColor="gray"  padding="medium" backgroundColor="#ffffff">

          <hstack gap="small" alignment="start middle" >

          <PixelText scale={1} color="black"> r/.....</PixelText>
          <PixelText scale={1} color="black"> 1hr ago</PixelText>

          <spacer grow />
          
            <hstack alignment="center middle">
            {renderHintHearts()}
            </hstack>

          </hstack>

          <spacer size="small" />

          <hstack gap="small" alignment="start" >
            {hintIndex <= 0 ? <PixelText scale={textSize} color="black"> .... </PixelText>: <PixelText scale={textSize} color="black"> The speakers keep getting bigger </PixelText> }
          </hstack>
          <hstack gap="small" alignment="start" >
          {hintIndex <= 0 ? <PixelText scale={textSize} color="black"> ....  </PixelText> : <PixelText scale={textSize} color="black"> and my living room stays the same size </PixelText>} 
          </hstack>

          <spacer size="small" />

          <image
            imageHeight={180}
            imageWidth={400}
            height="180px"
            width= {pictureWidth}
            resizeMode="fill"
            url={ hintIndex > 1 ? currentQuestion.image2 : currentQuestion.image}
          />
           

          <spacer  grow />

          <hstack gap="small" alignment="middle start">

          <hstack width="100px"  height="25px" alignment="center middle" gap="small" backgroundColor="gray">
            <hstack width="100%" height="100%" alignment="center middle" backgroundColor={Settings.theme.primary} padding="small" >

               <PixelSymbol type="arrow-up" color="##000000" scale={2}/>
                <spacer size="small" />
                {hintIndex <= 1 ? <PixelText scale={1} color="#000000">???</PixelText> : <PixelText scale={1} color="#000000">{currentQuestion.upvotes}</PixelText> }

          </hstack>
          </hstack>   

          <CustomButton
              width="150px"
              height="25px"
              textSize={1}
              label={"Submit Guess"}
              onClick={()=> context.ui.showForm(myForm)}
                          />

          </hstack>


        </vstack>        
      </vstack>
    </vstack>
  );
};