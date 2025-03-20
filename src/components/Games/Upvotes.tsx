import { Context, Devvit, JSONObject, useInterval, useState } from "@devvit/public-api";
import { GameProps, UserData } from "../../types.js";

import Settings from '../../Settings.json';
import { PixelText } from "../Addons/PixelText.js";
import { ProgressBar } from "../Addons/ProgressBar.js";

interface UpvotesPageProps {
  onComplete: () => void;
  onCancel: () => void;
  userData: UserData | null;
  setScore: ((value: number | ((prevState: number) => number)) => void);

}

interface PostComparison extends JSONObject {
  postA: {
    image: string;
    title: string;
    upvotes: number;
  };
  postB: {
    image: string;
    title: string;
    upvotes: number;
  },
}

export const UpvotesPage = (
  props: GameProps,
  context: Context
): JSX.Element => {

  const { onComplete, onCancel, userData, setScore, setUserGuess } = props;
  
  // Sample post comparisons - in a real app, these would come from an API or database
  const [comparisons] = useState<PostComparison[]>([
    {
      postA: {
        image: "post1A.jpg",
        title: "I built a PC case out of LEGO",
        upvotes: 45327
      },
      postB: {
        image: "post1B.jpg",
        title: "My cat looks like Danny DeVito",
        upvotes: 67812
      }
    },
    {
      postA: {
        image: "post2A.jpg",
        title: "I found a safe in my new house",
        upvotes: 89432
      },
      postB: {
        image: "post2B.jpg",
        title: "I restored this painting I found at a garage sale",
        upvotes: 32156
      }
    },
    {
      postA: {
        image: "post3A.jpg",
        title: "I took a picture of Saturn with my phone",
        upvotes: 23567
      },
      postB: {
        image: "post3B.jpg",
        title: "I made bread for the first time",
        upvotes: 19847
      }
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedPost, setSelectedPost] = useState<'A' | 'B' | null>(null);

  const [nextQuestionTime, setNextQuestionTime] = useState(100000) // Large number ;

  // Timer to automatically move to the next question
  useInterval(() => {

    setNextQuestionTime( (nextQuestionTime) => nextQuestionTime - 500)
    const remainingTime = nextQuestionTime - 500;
    
    if (remainingTime <= 0) {
      handleNextQuestion();
      setNextQuestionTime(100000);
    }
  }, 500).start();
  
  const currentComparison = comparisons[currentIndex];

  const handleSelection = (choice: 'A' | 'B') => {
    setSelectedPost(choice);
    
    // Determine if the user was correct
    const postAUpvotes = currentComparison.postA.upvotes;
    const postBUpvotes = currentComparison.postB.upvotes;
    const correct = 
      (choice === 'A' && postAUpvotes > postBUpvotes) || 
      (choice === 'B' && postBUpvotes > postAUpvotes);
    
    if (correct) {
      setScore(prevScore => prevScore + 1);
      setUserGuess(prevState => [...prevState, 'Y'])

    }
    else {
      setUserGuess(prevState => [...prevState, 'N'])
    }

    setNextQuestionTime(1500)
    
    setShowResults(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < comparisons.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResults(false);
      setSelectedPost(null);
    } else {
      // We've reached the end of the questions
      onComplete();
    }
  };

  const renderPostCard = (post: PostComparison['postA'], label: string, isSelected: boolean) => {
    return (
      <vstack 
        backgroundColor={isSelected ? "rgba(255, 140, 0, 0.2)" : Settings.theme.secondary}
        borderColor={isSelected ? "orange" : "#000000"}
        border={isSelected ? "thick" : "thin"}
        padding="medium"
        width="48%"
        onPress={() => handleSelection(label as 'A' | 'B')}
      >
        <PixelText scale={1} color="#000000">{post.title}</PixelText>
        <spacer size="small" />
        <zstack border="thin" borderColor="#000000">
        <image
          url={post.image}
          imageHeight={250}
          imageWidth={250}
          height="150px"
          width="100%"
        />
        </zstack>
        
        {showResults && (
          <text color="gray" alignment="center">
            {post.upvotes.toLocaleString()} upvotes
          </text>
        )}
      </vstack>
    );
  };

  return (
    <vstack width="100%" height="100%" padding="medium" >
      <hstack width="100%" alignment="middle center">
      <image
                imageHeight={128}
                imageWidth={256}
                width="256px"
                height="128px"
     url={`data:image/svg+xml,
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 256 128" shape-rendering="crispEdges">
                   <path stroke="#000000" d="M59 17h8M59 18h8M59 19h8M59 20h8M59 21h8M59 22h8M59 23h8M59 24h8M52 25h7M67 25h7M52 26h7M67 26h7M52 27h7M67 27h7M52 28h7M67 28h7M52 29h7M67 29h7M52 30h7M67 30h7M99 30h3M109 30h2M115 30h9M131 30h3M144 30h3M154 30h6M167 30h15M186 30h12M52 31h7M67 31h7M99 31h3M109 31h2M115 31h9M131 31h3M144 31h3M154 31h6M167 31h15M186 31h12M44 32h8M74 32h7M99 32h3M109 32h2M115 32h9M131 32h3M144 32h3M154 32h6M167 32h15M186 32h12M44 33h8M74 33h7M99 33h3M109 33h2M115 33h3M131 33h3M144 33h3M173 33h3M186 33h3M44 34h8M74 34h7M99 34h3M109 34h2M115 34h3M125 34h2M131 34h3M144 34h3M151 34h2M160 34h3M173 34h3M186 34h3M44 35h8M74 35h7M99 35h3M109 35h2M115 35h3M125 35h2M131 35h3M144 35h3M151 35h2M160 35h3M173 35h3M186 35h3M44 36h8M74 36h7M99 36h3M109 36h2M115 36h3M151 36h2M160 36h3M173 36h3M186 36h3M44 37h8M74 37h7M99 37h3M109 37h2M115 37h9M135 37h2M141 37h3M151 37h2M160 37h3M173 37h3M186 37h9M44 38h8M74 38h7M99 38h3M109 38h2M115 38h9M135 38h2M141 38h3M151 38h2M160 38h3M173 38h3M186 38h9M44 39h8M74 39h7M99 39h3M109 39h2M115 39h3M135 39h2M141 39h3M151 39h2M160 39h3M173 39h3M186 39h3M37 40h7M81 40h8M99 40h3M109 40h2M115 40h3M135 40h2M141 40h3M151 40h2M160 40h3M173 40h3M186 40h3M37 41h7M81 41h8M99 41h3M109 41h2M115 41h3M135 41h2M141 41h3M151 41h2M160 41h3M173 41h3M186 41h3M37 42h7M81 42h8M99 42h3M109 42h2M115 42h3M135 42h2M141 42h3M151 42h2M160 42h3M173 42h3M186 42h3M37 43h7M81 43h8M102 43h6M115 43h3M138 43h2M154 43h6M173 43h3M186 43h12M37 44h7M81 44h8M102 44h6M115 44h3M138 44h2M154 44h6M173 44h3M186 44h12M37 45h7M81 45h8M102 45h6M115 45h3M138 45h2M154 45h6M173 45h3M186 45h12M37 46h7M81 46h8M29 47h8M89 47h7M29 48h8M89 48h7M29 49h8M89 49h7M29 50h8M89 50h7M29 51h8M89 51h7M29 52h8M89 52h7M29 53h8M89 53h7M11 54h26M87 54h26M11 55h26M87 55h26M11 56h26M87 56h26M11 57h26M87 57h26M7 58h4M37 58h4M83 58h4M113 58h4M7 59h4M37 59h4M83 59h4M113 59h4M7 60h4M37 60h4M83 60h4M113 60h4M7 61h4M37 61h4M83 61h4M113 61h4M126 61h20M151 61h15M176 61h10M196 61h5M211 61h5M221 61h25M3 62h4M41 62h3M80 62h3M117 62h3M126 62h20M151 62h15M176 62h10M196 62h5M211 62h5M221 62h25M3 63h4M41 63h3M80 63h3M117 63h3M126 63h20M151 63h15M176 63h10M196 63h5M211 63h5M221 63h25M3 64h4M41 64h3M80 64h3M117 64h3M126 64h20M151 64h15M176 64h10M196 64h5M211 64h5M221 64h25M3 65h4M41 65h3M80 65h3M117 65h3M126 65h20M151 65h15M176 65h10M196 65h5M211 65h5M221 65h25M3 66h4M41 66h3M80 66h3M117 66h3M126 66h5M156 66h5M171 66h5M196 66h5M211 66h5M231 66h5M3 67h4M41 67h3M80 67h3M117 67h3M126 67h5M156 67h5M171 67h5M196 67h5M211 67h5M231 67h5M3 68h4M41 68h3M80 68h3M117 68h3M126 68h5M156 68h5M171 68h5M196 68h5M211 68h5M231 68h5M3 69h4M41 69h11M74 69h9M117 69h3M126 69h5M156 69h5M171 69h5M196 69h5M211 69h5M231 69h5M3 70h4M41 70h11M74 70h9M117 70h3M126 70h5M156 70h5M171 70h5M196 70h5M211 70h5M231 70h5M3 71h4M41 71h11M74 71h9M117 71h3M126 71h15M156 71h5M171 71h5M181 71h10M196 71h20M231 71h5M3 72h4M41 72h11M74 72h9M117 72h3M126 72h15M156 72h5M171 72h5M181 72h10M196 72h20M231 72h5M3 73h4M41 73h11M74 73h9M117 73h3M126 73h15M156 73h5M171 73h5M181 73h10M196 73h20M231 73h5M3 74h4M41 74h11M74 74h9M117 74h3M126 74h15M156 74h5M171 74h5M181 74h10M196 74h20M231 74h5M3 75h4M41 75h11M74 75h9M117 75h3M126 75h15M156 75h5M171 75h5M181 75h10M196 75h20M231 75h5M3 76h4M41 76h11M74 76h9M117 76h3M126 76h5M156 76h5M171 76h5M186 76h5M196 76h5M211 76h5M231 76h5M3 77h4M41 77h11M74 77h9M117 77h3M126 77h5M156 77h5M171 77h5M186 77h5M196 77h5M211 77h5M231 77h5M3 78h4M16 78h4M35 78h17M74 78h9M93 78h3M111 78h9M126 78h5M156 78h5M171 78h5M186 78h5M196 78h5M211 78h5M231 78h5M3 79h4M16 79h4M35 79h17M74 79h9M93 79h3M111 79h9M126 79h5M156 79h5M171 79h5M186 79h5M196 79h5M211 79h5M231 79h5M3 80h4M16 80h4M35 80h17M74 80h9M93 80h3M111 80h9M126 80h5M156 80h5M171 80h5M186 80h5M196 80h5M211 80h5M231 80h5M3 81h4M16 81h4M35 81h17M74 81h9M93 81h3M111 81h9M126 81h5M151 81h15M176 81h10M196 81h5M211 81h5M231 81h5M7 82h4M20 82h19M44 82h8M74 82h7M83 82h4M96 82h19M126 82h5M151 82h15M176 82h10M196 82h5M211 82h5M231 82h5M7 83h4M20 83h19M44 83h8M74 83h7M83 83h4M96 83h19M126 83h5M151 83h15M176 83h10M196 83h5M211 83h5M231 83h5M7 84h4M20 84h19M44 84h8M74 84h7M83 84h4M96 84h19M126 84h5M151 84h15M176 84h10M196 84h5M211 84h5M231 84h5M7 85h4M20 85h19M44 85h8M74 85h7M83 85h4M96 85h19M126 85h5M151 85h15M176 85h10M196 85h5M211 85h5M231 85h5M11 86h3M35 86h4M44 86h8M74 86h7M87 86h4M111 86h4M11 87h3M35 87h4M44 87h8M74 87h7M87 87h4M111 87h4M11 88h3M35 88h4M44 88h8M74 88h7M87 88h4M111 88h4M14 89h25M44 89h8M74 89h7M91 89h24M14 90h25M44 90h8M74 90h7M91 90h24M14 91h25M44 91h8M74 91h7M91 91h24M14 92h25M44 92h8M74 92h7M91 92h24M44 93h8M74 93h7M44 94h8M74 94h7M44 95h8M74 95h7M44 96h8M74 96h7M44 97h8M74 97h7M44 98h37M44 99h37M44 100h37M44 101h37M44 102h37M44 103h37M44 104h37M44 105h37" />
                <path stroke="#ff7e00" d="M59 25h8M59 26h8M59 27h8M59 28h8M59 29h8M59 30h8M59 31h8M52 32h22M52 33h22M52 34h22M52 35h22M52 36h22M52 37h22M52 38h22M52 39h22M44 40h37M44 41h37M44 42h37M44 43h37M44 44h37M44 45h37M44 46h37M37 47h52M37 48h52M37 49h52M37 50h52M37 51h52M37 52h52M37 53h52M37 54h50M37 55h50M37 56h50M37 57h50M41 58h42M41 59h42M41 60h42M41 61h42M44 62h36M44 63h36M44 64h36M44 65h36M44 66h36M44 67h36M44 68h36M52 69h22M52 70h22M52 71h22M52 72h22M52 73h22M52 74h22M52 75h22M52 76h22M52 77h22M52 78h22M52 79h22M52 80h22M52 81h22M52 82h22M52 83h22M52 84h22M52 85h22M52 86h22M52 87h22M52 88h22M52 89h22M52 90h22M52 91h22M52 92h22M52 93h22M52 94h22M52 95h22M52 96h22M52 97h22" />
                <path stroke="rgba(0,0,0,0.058823529411764705)" d="M98 30h1M98 31h1M98 32h1M98 33h1M98 34h1M189 34h1M98 35h1M189 35h1M98 36h1M147 36h1M98 37h1M98 38h1M98 39h1M98 40h1M189 40h1M98 41h1M189 41h1M98 42h1M189 42h1M108 46h1" />
                <path stroke="rgba(0,0,0,0.4980392156862745)" d="M108 30h1M108 31h1M108 32h1M108 33h1M108 34h1M108 35h1M108 36h1M119 36h8M131 36h6M141 36h6M190 36h5M108 37h1M108 38h1M108 39h1M108 40h1M108 41h1M108 42h1M108 43h1M108 44h1M108 45h1" />
                <path stroke="rgba(0,0,0,0.8117647058823529)" d="M111 30h1M111 31h1M111 32h1M111 33h1M111 34h1M111 35h1M111 36h1M111 37h1M111 38h1M111 39h1M119 39h5M190 39h5M111 40h1M111 41h1M111 42h1M140 43h1M140 44h1M140 45h1" />
                <path stroke="rgba(0,0,0,0.6862745098039216)" d="M124 30h1M124 31h1M124 32h1M153 34h1M153 35h1M153 36h1M124 37h1M153 37h1M124 38h1M153 38h1M153 39h1M153 40h1M153 41h1M153 42h1" />
                <path stroke="rgba(0,0,0,0.24705882352941178)" d="M134 30h1M134 31h1M134 32h1M119 33h5M134 33h1M154 33h6M167 33h6M177 33h5M190 33h8M134 34h1M134 35h1" />
                <path stroke="rgba(0,0,0,0.12156862745098039)" d="M147 30h1M147 31h1M147 32h1M147 33h1M118 34h1M147 34h1M118 35h1M147 35h1M118 40h1M118 41h1M118 42h1M118 43h1M118 44h1M118 45h1M102 46h6M115 46h3M138 46h2M154 46h6M173 46h3M186 46h12" />
                <path stroke="rgba(0,0,0,0.30980392156862746)" d="M153 30h1M153 31h1M153 32h1M124 34h1M163 34h1M124 35h1M163 35h1M163 36h1M195 36h1M163 37h1M163 38h1M163 39h1M163 40h1M163 41h1M163 42h1M153 43h1M153 44h1M153 45h1" />
                <path stroke="rgba(0,0,0,0.43529411764705883)" d="M166 30h1M166 31h1M166 32h1M137 43h1M137 44h1M137 45h1" />
                <path stroke="rgba(0,0,0,0.7490196078431373)" d="M182 30h1M182 31h1M182 32h1M125 33h2M151 33h2M160 33h3M134 37h1M134 38h1M134 39h1M134 40h1M134 41h1M134 42h1" />
                <path stroke="rgba(0,0,0,0.8745098039215686)" d="M198 30h1M198 31h1M198 32h1M198 43h1M198 44h1M198 45h1" />
                <path stroke="rgba(0,0,0,0.3411764705882353)" d="M118 33h1" />
                <path stroke="rgba(0,0,0,0.403921568627451)" d="M124 33h1" />
                <path stroke="rgba(0,0,0,0.7019607843137254)" d="M127 33h1" />
                <path stroke="rgba(0,0,0,0.4196078431372549)" d="M150 33h1" />
                <path stroke="rgba(0,0,0,0.592156862745098)" d="M153 33h1" />
                <path stroke="rgba(0,0,0,0.23137254901960785)" d="M163 33h1" />
                <path stroke="rgba(0,0,0,0.10588235294117647)" d="M166 33h1M198 46h1" />
                <path stroke="rgba(0,0,0,0.38823529411764707)" d="M176 33h1" />
                <path stroke="rgba(0,0,0,0.1843137254901961)" d="M182 33h1M176 34h1M176 35h1M176 36h1M140 37h1M176 37h1M140 38h1M176 38h1M140 39h1M176 39h1M140 40h1M176 40h1M140 41h1M176 41h1M140 42h1M176 42h1M176 43h1M176 44h1M176 45h1" />
                <path stroke="rgba(0,0,0,0.29411764705882354)" d="M189 33h1" />
                <path stroke="rgba(0,0,0,0.21568627450980393)" d="M198 33h1" />
                <path stroke="rgba(0,0,0,0.9372549019607843)" d="M127 34h1M127 35h1" />
                <path stroke="rgba(0,0,0,0.5607843137254902)" d="M150 34h1M150 35h1M118 36h1M150 36h1M137 37h1M150 37h1M137 38h1M150 38h1M137 39h1M150 39h1M137 40h1M150 40h1M137 41h1M150 41h1M137 42h1M150 42h1" />
                <path stroke="rgba(0,0,0,0.4666666666666667)" d="M127 36h1" />
                <path stroke="rgba(0,0,0,0.2784313725490196)" d="M137 36h1" />
                <path stroke="rgba(0,0,0,0.09019607843137255)" d="M140 36h1" />
                <path stroke="rgba(0,0,0,0.5294117647058824)" d="M189 36h1" />
                <path stroke="rgba(0,0,0,0.6235294117647059)" d="M195 37h1M195 38h1" />
                <path stroke="rgba(0,0,0,0.8352941176470589)" d="M118 39h1" />
                <path stroke="rgba(0,0,0,0.5568627450980392)" d="M124 39h1" />
                <path stroke="rgba(0,0,0,0.8235294117647058)" d="M189 39h1" />
                <path stroke="rgba(0,0,0,0.5058823529411764)" d="M195 39h1" />
                <path stroke="rgba(0,0,0,0.011764705882352941)" d="M118 46h1" />
                <path stroke="rgba(0,0,0,0.050980392156862744)" d="M137 46h1" />
                <path stroke="rgba(0,0,0,0.09803921568627451)" d="M140 46h1" />
                <path stroke="rgba(0,0,0,0.03529411764705882)" d="M153 46h1" />
                <path stroke="rgba(0,0,0,0.0196078431372549)" d="M176 46h1" />
                <path stroke="#ed1c24" d="M11 58h26M87 58h26M11 59h26M87 59h26M11 60h26M87 60h26M11 61h26M87 61h26M7 62h30M83 62h30M7 63h30M83 63h30M7 64h30M83 64h30M7 65h30M83 65h30M7 66h30M83 66h30M7 67h30M83 67h30M7 68h30M83 68h30M7 69h30M83 69h30M7 70h30M83 70h30M7 71h30M83 71h30M7 72h30M83 72h30M7 73h30M83 73h30M7 74h30M83 74h30M7 75h9M20 75h17M83 75h10M96 75h17M7 76h9M20 76h17M83 76h10M96 76h17M7 77h9M20 77h17M83 77h10M96 77h17M7 78h9M83 78h10M7 79h9M83 79h10M7 80h9M83 80h10M7 81h9M83 81h10M14 82h6M91 82h5M14 83h6M91 83h5M14 84h6M91 84h5M14 85h6M91 85h5" />
                <path stroke="#990030" d="M37 62h4M113 62h4M37 63h4M113 63h4M37 64h4M113 64h4M37 65h4M113 65h4M37 66h4M113 66h4M37 67h4M113 67h4M37 68h4M113 68h4M37 69h4M113 69h4M37 70h4M113 70h4M37 71h4M113 71h4M37 72h4M113 72h4M37 73h4M113 73h4M37 74h4M113 74h4M16 75h4M37 75h4M93 75h3M113 75h4M16 76h4M37 76h4M93 76h3M113 76h4M16 77h4M37 77h4M93 77h3M113 77h4M20 78h15M96 78h15M20 79h15M96 79h15M20 80h15M96 80h15M20 81h15M96 81h15M11 82h3M87 82h4M11 83h3M87 83h4M11 84h3M87 84h4M11 85h3M87 85h4M14 86h21M91 86h20M14 87h21M91 87h20M14 88h21M91 88h20" />
                </svg>`}
               />
      </hstack>
      
      <spacer size="small" />
      
      <vstack alignment="center middle" >

        <ProgressBar width={256} onComplete={onCancel} />
      </vstack>
      
      <spacer size="large" />
      
          
      <hstack width="100%" gap="medium" alignment="middle center">
        {renderPostCard(currentComparison.postA, 'A', selectedPost === 'A')}
        {renderPostCard(currentComparison.postB, 'B', selectedPost === 'B')}
      </hstack>
      
      <spacer size="large" />
      
      {showResults && (
        <vstack gap="medium" alignment="middle center">
          <text size="large" color={
            ((selectedPost === 'A' && currentComparison.postA.upvotes > currentComparison.postB.upvotes) || 
             (selectedPost === 'B' && currentComparison.postB.upvotes > currentComparison.postA.upvotes)) 
              ? "green" : "red"
          }>
            {((selectedPost === 'A' && currentComparison.postA.upvotes > currentComparison.postB.upvotes) || 
              (selectedPost === 'B' && currentComparison.postB.upvotes > currentComparison.postA.upvotes)) 
              ? "Correct!" : "Wrong!"}
          </text>
         
        </vstack>
      )}
    </vstack>
  );
};