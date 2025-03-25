import { Devvit } from "@devvit/public-api";
import { PixelText } from "../Addons/PixelText.js";

interface OptionItemProps {
    index: number;
    option: string;
    selectedOption: number | null;
    correctAnswer: number;
    showResult: boolean;
    onSelect: (index: number) => void;
    }



// OptionItem component for Reddit Devvit
export const OptionItem = (props: OptionItemProps) => {

    const { index, option, selectedOption, correctAnswer, showResult, onSelect } = props;

    const backgroundColor = 
      showResult
        ? index === correctAnswer
          ? "rgba(0, 255, 0, 0.2)"  // Correct answer green
          : selectedOption === index && selectedOption !== correctAnswer
            ? "rgba(255, 0, 0, 0.2)"  // Wrong answer red
            : "white"
        : selectedOption === index
          ? "rgba(0, 0, 255, 0.1)"  // Selected blue
          : "white";  // Default white

         
    return (
      <vstack 
        width="50%" 
        padding="small"
        backgroundColor="#013839"
        onPress={() => onSelect(index)}
      >
         <vstack alignment="middle center" width="100%" backgroundColor={backgroundColor} padding="small" height={"50px"}>
        <PixelText scale={1.5} color="#000000">{option}</PixelText>
        </vstack>
      </vstack>
    );
  };
  