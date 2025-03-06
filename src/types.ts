

/*
* Indetification of subreddit objects
*/

export type PostId = `t3_${string}`;

export enum PostType {
    PUZZLE = 'Puzzle',
    PINNED = 'pinned'
}

export type GameSettings = {
    subredditName: string;
    
}

export type UserData ={
    score: number;
    solved: boolean;
    skipped: boolean;
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