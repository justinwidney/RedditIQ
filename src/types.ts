

/*
* Indetification of subreddit objects
*/

export type PostId = `t3_${string}`;
export type usernameID = `t1_${string}`;


/*
* Score Types for the Game to save in redis
*/

export type BinaryScore = 'Y' | 'N';  // Yes/No for simple correct/incorrect
export type GradedScore = 'F' | 'H' | 'N';  // Full/Half/None for partially correct answers
export type MultipleChoiceScore = 'A' | 'B' | 'C' | 'D';  // Multiple choice answers

export type GameScore = BinaryScore | GradedScore | MultipleChoiceScore;
export type CompositeScore<T extends GameScore> = string; // Will be formatted as "Y,N,Y" or "F-H-N"

export interface GameScoreData {
    celebGuess: BinaryScore;
    trivia: MultipleChoiceScore;
    subredditGuess: GradedScore;
    copyPasta: CompositeScore<GradedScore>; // For multiple words, like "F,H,N,F"
    upvotes: GradedScore;
    historian: CompositeScore<BinaryScore>; // For ordering multiple posts, like "Y-N-Y-Y"
  }
  
  // Type for each game's score
  export type GameType = keyof GameScoreData;


  /* Post Type for the Game to save in redis
    */

export enum PostType {
    PUZZLE = 'Puzzle',
    PINNED = 'pinned'
}

export type GameSettings = {
    subredditName: string;
    questions: string
}

interface PostData {
    postId: PostId
    postTitle: string;
  }
  

export type UserData ={
    score: number;
    solved: boolean;
    skipped: boolean;
}


export interface GameProps {
    onComplete: () => void;
    onCancel: (skip:boolean) => void;
    userData: UserData | null;
    setScore: (value: number | ((prevState: number) => number)) => void;
    setUserGuess: (value: GameScore[] | ((prevState: GameScore[]) => GameScore[])) => void;
}

export type PinnedPostData = {
    postId: PostId;
    postType: string;
};

export type PuzzlePostData = {
    postId: PostId;
    postType: string;
    authorUsername: string;
    date: number;
    solves: number;
    puzzle: string;
    solution: string;
}

