

/*
* Indetification of subreddit objects
*/

export type PostId = `t3_${string}`;
export type usernameID = `t1_${string}`;


/*
* Score Types for the Game to save in redis
*/

export type MultipleChoiceScore = '-1' | '3' | '2' | '1' | '0';  // Multiple choice answers

export type GameScore =  MultipleChoiceScore;
export type CompositeScore<T extends GameScore> = string; // Will be formatted as "Y,N,Y" or "F-H-N"

export interface GameScoreData {
    celebGuess: MultipleChoiceScore;
    trivia: MultipleChoiceScore;
    subredditGuess: MultipleChoiceScore;
    copyPasta: MultipleChoiceScore; // For multiple words, like "F,H,N,F"
    upvotes: MultipleChoiceScore;
    historian: MultipleChoiceScore; // For ordering multiple posts, like "Y-N-Y-Y"
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
    fileName: string;
    title: string;
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
    onComplete: (userGuess: MultipleChoiceScore[]) => void;
    onCancel: (skip:boolean) => void;
    userData: UserData | null;
    setScore: (value: number | ((prevState: number) => number)) => void;
    userGuess: GameScore[];
    setUserGuess: (value: GameScore[] | ((prevState: GameScore[]) => GameScore[])) => void;
    question: Question;
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

interface BaseQuestion {
    type: 'celebrity' | 'historian' | 'pasta' | 'subreddit' | 'trivia' | 'upvotes';
  }
  
  // Celebrity question type
  export interface CelebrityQuestion extends BaseQuestion {
    type: 'celebrity';
    image: string;
    images?: string[];
    answers: string[];
    name?: string;
    hint?: string;
    redditRelevance?: string;
  }
  
  // Historian question type
  export interface HistorianQuestion extends BaseQuestion {
    type: 'historian';
    image: string;
    link?: string;
    content: {
      title: string;
      content: string;
      subreddit: string;
    };
    answer: {
      month: number;
      year: number;
    };
  }
  
  // Pasta question type
  export interface PastaQuestion extends BaseQuestion {
    type: 'pasta';
    text: string;
    blanks: string[];
    reference: string;
    options: [string[], number][]; // Array of [array of options, correct index]
  }
  
  // Subreddit question type
  export interface SubredditQuestion extends BaseQuestion {
    type: 'subreddit';
    subreddit: string;
    image: string;
    image2: string;
    answer: string;
    title : string;
    upvotes: number;
  }
  
  // Trivia question type
  export interface TriviaQuestionItem {
    question: string;
    options: string[];
    correctAnswer: number;
  }
  
  export interface TriviaQuestion extends BaseQuestion {
    type: 'trivia';
    questions: TriviaQuestionItem[];
  }
  
  // Upvotes question type
  interface RedditPost {
    image: string;
    title: string;
    upvotes: number;
    subreddit: string;
  }
  
  export interface PostComparison {
    postA: RedditPost;
    postB: RedditPost;
  }
  
  export interface UpvotesQuestion extends BaseQuestion {
    type: 'upvotes';
    comparisons: PostComparison[];
    link?: string;
  }

  export type Question = 
  | CelebrityQuestion 
  | HistorianQuestion 
  | PastaQuestion 
  | SubredditQuestion 
  | TriviaQuestion 
  | UpvotesQuestion;

// Main quiz data structure
interface QuizData {
  questions: Question[];
}


