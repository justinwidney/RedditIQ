import { Context, useState, Devvit, useAsync } from "@devvit/public-api";
import { TutorialPage } from "../../components/Pages/TutorialPage.js";
import { CustomButton } from "../../components/Addons/CustomButton.js";

import { SolvePageRouter } from "../../components/SolvePageRouter.js";
import { GameSettings, PostId, PuzzlePostData, UserData } from "../../types.js";
import { Engine } from "../../engine/Engine.js";
import { StatsPage } from "../../components/Pages/ScorePage.js";
import { PixelText } from "../../components/Addons/PixelText.js";
import { LoadingState } from "../../components/Addons/LoadingState.js";
import { renderHintHearts } from "../../components/Addons/Hearts.js";
import { Shadow } from "../../components/Addons/Shadow.js";




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
    gameSettings: GameSettings;
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
    //const questions = props.gameSettings.questions;
    const dimensions = context.dimensions || { width: 700, height: 500 }; 

    const extraPadding = dimensions.width > 450 

    const { data:player, loading} = useAsync<{
      playerCount: number;
      rank: number;
      score: number;
      questions: any[];
      answer: string[]
    }>(async () => {
      const players = await engine.getPlayerCount(props.postData.postId);
      const user = await engine.getUserScore(props.username);
      const questions = await loadQuestionsFromPath(props.postSettings?.title || props.gameSettings.title);


      return {
        playerCount: players ? players : 0,
        rank: user.rank,
        score: user.score,
        questions: questions.questions,
        answer: questions.answer
      }
    });

    
    if (player === null || loading) {
      return <LoadingState />;
    }
  
    const questions = createComponentIndexArray(player.questions);

    const [page, setPage] = useState(
       isSolved ? 'score' : 'menu'
    );

    const Title = props.postSettings?.title || props.gameSettings.title;
     

    const Menu = (
        <vstack width="100%" height="100%" alignment="middle center" >

            <spacer height={"32px"} />

            <hstack width="80%" padding="medium" >
              <spacer grow />
              {renderHintHearts(0)}
            </hstack>


            <hstack width="100%" alignment="center middle">
              <zstack alignment="center middle" width={"60%"}>

            <vstack width="100%" alignment="middle center" height={"200px"} >
              <image

                  imageHeight={150}
                  imageWidth={300}
                  width={extraPadding ? "341px" : "250px"}
                  height="171px"
                          url={`data:image/svg+xml,
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.5 256 128" shape-rendering="crispEdges">
                      <path stroke="#9c5a3c" d="M15 11h218M15 12h218M15 13h218M15 14h4M229 14h4M15 15h4M229 15h4M15 16h4M229 16h4M15 17h4M229 17h4M15 18h4M229 18h4M15 19h4M229 19h4M15 20h4M229 20h4M15 21h4M229 21h4M15 22h4M229 22h4M15 23h4M229 23h4M15 24h4M229 24h4M15 25h4M229 25h4M15 26h4M229 26h4M15 27h4M229 27h4M15 28h4M229 28h4M15 29h4M229 29h4M15 30h4M229 30h4M15 31h4M229 31h4M15 32h4M229 32h4M15 33h4M229 33h4M15 34h4M229 34h4M15 35h4M229 35h4M15 36h4M229 36h4M15 37h4M229 37h4M15 38h4M229 38h4M15 39h4M229 39h4M15 40h4M229 40h4M15 41h4M229 41h4M15 42h4M229 42h4M15 43h4M229 43h4M15 44h4M229 44h4M15 45h4M229 45h4M15 46h4M229 46h4M15 47h4M229 47h4M15 48h4M229 48h4M15 49h4M229 49h4M15 50h4M229 50h4M15 51h4M229 51h4M15 52h4M229 52h4M15 53h4M229 53h4M15 54h4M229 54h4M15 55h4M229 55h4M15 56h4M229 56h4M15 57h4M229 57h4M15 58h4M229 58h4M15 59h4M229 59h4M15 60h4M229 60h4M15 61h4M229 61h4M15 62h4M229 62h4M15 63h4M229 63h4M15 64h4M229 64h4M15 65h4M229 65h4M15 66h4M229 66h4M15 67h4M229 67h4M15 68h4M229 68h4M15 69h4M229 69h4M15 70h4M229 70h4M15 71h4M229 71h4M15 72h4M229 72h4M15 73h4M229 73h4M15 74h4M229 74h4M15 75h4M229 75h4M15 76h4M229 76h4M15 77h4M229 77h4M15 78h4M229 78h4M15 79h4M229 79h4M15 80h4M229 80h4M15 81h4M229 81h4M15 82h4M229 82h4M15 83h4M229 83h4M15 84h4M229 84h4M15 85h4M229 85h4M15 86h4M229 86h4M15 87h4M229 87h4M15 88h4M229 88h4M15 89h4M229 89h4M15 90h4M229 90h4M15 91h4M229 91h4M15 92h4M229 92h4M15 93h4M229 93h4M15 94h4M229 94h4M15 95h4M229 95h4M15 96h4M229 96h4M15 97h4M229 97h4M15 98h4M229 98h4M15 99h4M229 99h4M15 100h4M229 100h4M15 101h4M229 101h4M15 102h4M229 102h4M15 103h4M229 103h4M15 104h4M229 104h4M15 105h4M229 105h4M15 106h4M229 106h4M15 107h4M229 107h4M15 108h4M229 108h4M15 109h4M229 109h4M15 110h4M229 110h4M15 111h4M229 111h4M15 112h218M15 113h218M15 114h218M15 115h218" />
                      <path stroke="#24610a" d="M19 14h210M19 15h210M19 16h210M19 17h210M19 18h210M19 19h210M19 20h210M19 21h210M19 22h210M19 23h210M19 24h210M19 25h210M19 26h210M19 27h15M35 27h6M44 27h15M66 27h13M84 27h145M19 28h15M35 28h6M44 28h15M66 28h13M84 28h145M19 29h13M35 29h4M41 29h3M46 29h13M61 29h11M77 29h7M86 29h102M198 29h8M213 29h16M19 30h13M35 30h4M41 30h3M46 30h13M61 30h11M77 30h7M86 30h102M198 30h8M213 30h16M19 31h15M35 31h8M44 31h6M55 31h4M64 31h20M86 31h102M198 31h8M213 31h16M19 32h15M35 32h8M44 32h6M55 32h4M64 32h20M86 32h102M198 32h8M213 32h16M19 33h15M35 33h6M43 33h21M66 33h6M77 33h5M84 33h107M195 33h7M206 33h7M217 33h12M19 34h13M37 34h2M46 34h13M64 34h18M84 34h107M195 34h7M206 34h7M217 34h12M19 35h13M37 35h2M46 35h13M64 35h18M84 35h107M195 35h7M206 35h7M217 35h12M19 36h172M195 36h7M206 36h7M217 36h12M19 37h172M195 37h7M206 37h7M217 37h12M19 38h172M195 38h7M206 38h7M217 38h12M19 39h172M195 39h7M206 39h7M217 39h12M19 40h172M195 40h7M206 40h3M213 40h16M19 41h172M195 41h7M206 41h3M213 41h16M19 42h172M195 42h7M206 42h3M213 42h16M19 43h169M198 43h8M209 43h4M217 43h12M19 44h169M198 44h8M209 44h4M217 44h12M19 45h169M198 45h8M209 45h4M217 45h12M19 46h169M198 46h8M209 46h4M217 46h12M19 47h210M19 48h210M19 49h210M19 50h210M19 51h210M19 52h210M19 53h210M19 54h20M55 54h11M88 54h5M110 54h11M137 54h11M164 54h5M197 54h32M19 55h20M55 55h11M88 55h5M110 55h11M137 55h11M164 55h5M197 55h32M19 56h20M55 56h11M88 56h5M110 56h11M137 56h11M164 56h5M197 56h32M19 57h20M55 57h11M88 57h5M110 57h11M137 57h11M164 57h5M197 57h32M19 58h20M55 58h11M88 58h5M110 58h11M137 58h11M164 58h5M197 58h32M19 59h20M55 59h11M88 59h5M110 59h11M137 59h11M164 59h5M197 59h32M19 60h20M44 60h11M61 60h5M72 60h21M99 60h11M115 60h6M126 60h11M142 60h11M159 60h21M186 60h43M19 61h20M44 61h11M61 61h5M72 61h21M99 61h11M115 61h6M126 61h11M142 61h11M159 61h21M186 61h43M19 62h20M44 62h11M61 62h5M72 62h21M99 62h11M115 62h6M126 62h11M142 62h11M159 62h21M186 62h43M19 63h20M44 63h11M61 63h5M72 63h21M99 63h11M115 63h6M126 63h11M142 63h11M159 63h21M186 63h43M19 64h20M44 64h11M61 64h5M72 64h21M99 64h11M115 64h6M126 64h11M142 64h11M159 64h21M186 64h43M19 65h20M55 65h11M82 65h11M99 65h11M115 65h6M126 65h11M142 65h11M159 65h21M186 65h43M19 66h20M55 66h11M82 66h11M99 66h11M115 66h6M126 66h11M142 66h11M159 66h21M186 66h43M19 67h20M55 67h11M82 67h11M99 67h11M115 67h6M126 67h11M142 67h11M159 67h21M186 67h43M19 68h20M55 68h11M82 68h11M99 68h11M115 68h6M126 68h11M142 68h11M159 68h21M186 68h43M19 69h20M55 69h11M82 69h11M99 69h11M115 69h6M126 69h11M142 69h11M159 69h21M186 69h43M19 70h20M55 70h11M82 70h11M99 70h11M115 70h6M126 70h11M142 70h11M159 70h21M186 70h43M19 71h20M44 71h6M55 71h11M72 71h21M99 71h11M115 71h6M126 71h11M142 71h11M159 71h21M186 71h43M19 72h20M44 72h6M55 72h11M72 72h21M99 72h11M115 72h6M126 72h11M142 72h11M159 72h21M186 72h43M19 73h20M44 73h6M55 73h11M72 73h21M99 73h11M115 73h6M126 73h11M142 73h11M159 73h21M186 73h43M19 74h20M44 74h6M55 74h11M72 74h21M99 74h11M115 74h6M126 74h11M142 74h11M159 74h21M186 74h43M19 75h20M44 75h6M55 75h11M72 75h21M99 75h11M115 75h6M126 75h11M142 75h11M159 75h21M186 75h43M19 76h20M44 76h11M61 76h5M88 76h5M110 76h11M137 76h11M164 76h16M186 76h43M19 77h20M44 77h11M61 77h5M88 77h5M110 77h11M137 77h11M164 77h16M186 77h43M19 78h20M44 78h11M61 78h5M88 78h5M110 78h11M137 78h11M164 78h16M186 78h43M19 79h20M44 79h11M61 79h5M88 79h5M110 79h11M137 79h11M164 79h16M186 79h43M19 80h20M44 80h11M61 80h5M88 80h5M110 80h11M137 80h11M164 80h16M186 80h43M19 81h210M19 82h210M19 83h210M19 84h210M19 85h210M19 86h210M19 87h210M19 88h210M19 89h210M19 90h210M19 91h210M19 92h210M19 93h210M19 94h134M157 94h3M166 94h5M175 94h4M184 94h4M195 94h34M19 95h134M157 95h3M166 95h5M175 95h4M184 95h4M195 95h34M19 96h132M153 96h4M159 96h1M162 96h4M168 96h1M171 96h4M177 96h2M180 96h4M186 96h2M189 96h40M19 97h132M153 97h4M159 97h1M162 97h4M168 97h1M171 97h4M177 97h2M180 97h4M186 97h2M189 97h40M19 98h132M159 98h1M166 98h3M171 98h8M180 98h4M186 98h2M193 98h36M19 99h132M159 99h1M166 99h3M171 99h8M180 99h4M186 99h2M193 99h36M19 100h132M153 100h4M159 100h1M162 100h4M168 100h1M171 100h4M177 100h2M180 100h4M186 100h2M189 100h40M19 101h132M153 101h4M159 101h1M166 101h5M175 101h4M184 101h4M195 101h2M206 101h2M218 101h11M19 102h132M153 102h4M159 102h1M166 102h5M175 102h4M184 102h4M195 102h2M206 102h2M218 102h11M19 103h210M19 104h210M19 105h210M19 106h210M19 107h210M19 108h210M19 109h210M19 110h210M19 111h210" />
                      <path stroke="#ffffff" d="M34 27h1M41 27h3M59 27h7M79 27h5M34 28h1M41 28h3M59 28h7M79 28h5M32 29h3M39 29h2M44 29h2M59 29h2M72 29h5M84 29h2M188 29h10M206 29h7M32 30h3M39 30h2M44 30h2M59 30h2M72 30h5M84 30h2M188 30h10M206 30h7M34 31h1M43 31h1M50 31h5M59 31h5M84 31h2M188 31h10M206 31h7M34 32h1M43 32h1M50 32h5M59 32h5M84 32h2M188 32h10M206 32h7M34 33h1M41 33h2M64 33h2M72 33h5M82 33h2M191 33h4M202 33h4M213 33h4M32 34h5M39 34h7M59 34h5M82 34h2M191 34h4M202 34h4M213 34h4M32 35h5M39 35h7M59 35h5M82 35h2M191 35h4M202 35h4M213 35h4M191 36h4M202 36h4M213 36h4M191 37h4M202 37h4M213 37h4M191 38h4M202 38h4M213 38h4M191 39h4M202 39h4M213 39h4M191 40h4M202 40h4M209 40h4M191 41h4M202 41h4M209 41h4M191 42h4M202 42h4M209 42h4M188 43h10M206 43h3M213 43h4M188 44h10M206 44h3M213 44h4M188 45h10M206 45h3M213 45h4M188 46h10M206 46h3M213 46h4M39 54h16M66 54h22M93 54h17M121 54h16M148 54h16M169 54h28M39 55h16M66 55h22M93 55h17M121 55h16M148 55h16M169 55h28M39 56h16M66 56h22M93 56h17M121 56h16M148 56h16M169 56h28M39 57h16M66 57h22M93 57h17M121 57h16M148 57h16M169 57h28M39 58h16M66 58h22M93 58h17M121 58h16M148 58h16M169 58h28M39 59h16M66 59h22M93 59h17M121 59h16M148 59h16M169 59h28M39 60h5M55 60h6M66 60h6M93 60h6M110 60h5M121 60h5M137 60h5M153 60h6M180 60h6M39 61h5M55 61h6M66 61h6M93 61h6M110 61h5M121 61h5M137 61h5M153 61h6M180 61h6M39 62h5M55 62h6M66 62h6M93 62h6M110 62h5M121 62h5M137 62h5M153 62h6M180 62h6M39 63h5M55 63h6M66 63h6M93 63h6M110 63h5M121 63h5M137 63h5M153 63h6M180 63h6M39 64h5M55 64h6M66 64h6M93 64h6M110 64h5M121 64h5M137 64h5M153 64h6M180 64h6M39 65h16M66 65h16M93 65h6M110 65h5M121 65h5M137 65h5M153 65h6M180 65h6M39 66h16M66 66h16M93 66h6M110 66h5M121 66h5M137 66h5M153 66h6M180 66h6M39 67h16M66 67h16M93 67h6M110 67h5M121 67h5M137 67h5M153 67h6M180 67h6M39 68h16M66 68h16M93 68h6M110 68h5M121 68h5M137 68h5M153 68h6M180 68h6M39 69h16M66 69h16M93 69h6M110 69h5M121 69h5M137 69h5M153 69h6M180 69h6M39 70h16M66 70h16M93 70h6M110 70h5M121 70h5M137 70h5M153 70h6M180 70h6M39 71h5M50 71h5M66 71h6M93 71h6M110 71h5M121 71h5M137 71h5M153 71h6M180 71h6M39 72h5M50 72h5M66 72h6M93 72h6M110 72h5M121 72h5M137 72h5M153 72h6M180 72h6M39 73h5M50 73h5M66 73h6M93 73h6M110 73h5M121 73h5M137 73h5M153 73h6M180 73h6M39 74h5M50 74h5M66 74h6M93 74h6M110 74h5M121 74h5M137 74h5M153 74h6M180 74h6M39 75h5M50 75h5M66 75h6M93 75h6M110 75h5M121 75h5M137 75h5M153 75h6M180 75h6M39 76h5M55 76h6M66 76h22M93 76h17M121 76h16M148 76h16M180 76h6M39 77h5M55 77h6M66 77h22M93 77h17M121 77h16M148 77h16M180 77h6M39 78h5M55 78h6M66 78h22M93 78h17M121 78h16M148 78h16M180 78h6M39 79h5M55 79h6M66 79h22M93 79h17M121 79h16M148 79h16M180 79h6M39 80h5M55 80h6M66 80h22M93 80h17M121 80h16M148 80h16M180 80h6M153 94h4M160 94h6M171 94h4M179 94h5M188 94h7M153 95h4M160 95h6M171 95h4M179 95h5M188 95h7M151 96h2M157 96h2M160 96h2M166 96h2M169 96h2M175 96h2M179 96h1M184 96h2M188 96h1M151 97h2M157 97h2M160 97h2M166 97h2M169 97h2M175 97h2M179 97h1M184 97h2M188 97h1M151 98h8M160 98h6M169 98h2M179 98h1M184 98h2M188 98h5M151 99h8M160 99h6M169 99h2M179 99h1M184 99h2M188 99h5M151 100h2M157 100h2M160 100h2M166 100h2M169 100h2M175 100h2M179 100h1M184 100h2M188 100h1M151 101h2M157 101h2M160 101h6M171 101h4M179 101h5M188 101h7M197 101h9M208 101h10M151 102h2M157 102h2M160 102h6M171 102h4M179 102h5M188 102h7M197 102h9M208 102h10" />
                  </svg>`}
                  description="Reddit IQ Logo"
                  />
                  
              </vstack>

              <vstack alignment="start" width="100%" height={"200px"}>
              <image
                  imageHeight={128}
                  imageWidth={256}
                  width={extraPadding ? "140px" : "80px"}   
                  height={extraPadding ? "128px" : "80px"}   
                          url={`data:image/svg+xml,
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="11 -10 43 43" shape-rendering="crispEdges">
                          <g transform="rotate(-45, 32, 11)">
                          <rect x="12" y="1" width="40" height="20" fill="#FF0000" stroke-width="1" />
                          <text x="32" y="15" font-size="7" text-anchor="middle" fill="white">${Title}</text>
                          </g>
                          </svg>`}
                  description="Title Field"
                  />
              </vstack>
        
            </zstack>
            </hstack>


            <spacer size="small"/>
            


            <vstack alignment="center middle" gap="small">
              <CustomButton onClick={() => setPage('solve')} 
              label="Let's Go!"  width="160px" 
              height="60px" color="#FFFFFF" 
              textSize={2.5} 
              animating={extraPadding} />
            </vstack>

     

          <spacer size="small" />

            <hstack alignment="center middle" gap="small" width={"82%"} padding="small">



              {extraPadding ? <spacer width={"30%"} /> : null}

              <PixelText scale={2} color="white">Average IQ</PixelText>
              <spacer size="small" />
              <PixelText scale={3} color="white">{ AVERAGE_IQ}</PixelText>

              <spacer grow />

              <CustomButton onClick={() => setPage('tutorial')} label="?"  width="30px" height="30px" color="#FFFFFF" textSize={1}/>

            </hstack>

            <spacer size="large" />

            </vstack>
    )

       

    const onClose = (skip:boolean = false) :void => {
        setPage(  skip? 'score' : 'menu')
    }

    const pages: Record<string, JSX.Element> = {
        menu: Menu,
        tutorial : <TutorialPage onClose={onClose} />,
        solve: <SolvePageRouter {...props} onCancel={onClose} questions={questions} questionData={player.questions} />,
        score: <StatsPage puzzleName={Title} {...props} answer={player.answer} />
    }



    return pages[page] || Menu;

}