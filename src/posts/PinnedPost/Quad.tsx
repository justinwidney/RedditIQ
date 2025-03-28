import { Devvit } from "@devvit/public-api"
import { Row } from "./Row.js"


interface QuadProps {

    templateQuestions: {
        backgroundImageUrl: string;
        logoSvgUrl: string;
        exampleText: string;
        type: string;
    } []

    }

export const Quad = (props: QuadProps): JSX.Element => {

    const { templateQuestions } = props;


    if (!templateQuestions) return null;


    const firstSetQuestions = templateQuestions.slice(0, 2);
    const secondSetQuestions = templateQuestions.slice(2, 4);




 return (
    <vstack >
      {/* First set of rows */}


        <hstack>
          <Row 
            questionSet={firstSetQuestions}
          />
        </hstack>
    
      
      <spacer size="large" />
      
      {/* Second set of rows */}

         <hstack>
          <Row 
             questionSet={secondSetQuestions}
          />
        </hstack>
 
    </vstack>
  );
};