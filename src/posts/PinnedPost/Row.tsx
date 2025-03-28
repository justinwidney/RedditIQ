import { Devvit } from "@devvit/public-api";
import { Banner } from "./Banner.js";
import { GAME_SVG } from "../../data/svgs.js";


type RowProps = {
    questionSet: {
        backgroundImageUrl: string;
        exampleText: string;
        type: string;
    } []
  };




export const Row = (props: RowProps): JSX.Element => {

    const { questionSet: question, } = props;

    const firstQuestion = question[0];
    const secondQuestion = question[1];


    return (
      <hstack width="100%" gap="large" alignment="middle center" >
        {/* First Row */}
        <Banner
          backgroundImageUrl={firstQuestion.backgroundImageUrl}
          type = {firstQuestion.type}
          exampleText={firstQuestion.exampleText}
       
        />
        
        {/* Second Row */}
        <Banner
          backgroundImageUrl={secondQuestion.backgroundImageUrl}
          type = {secondQuestion.type}
          exampleText={secondQuestion.exampleText}
        />
      </hstack>
    );
  };