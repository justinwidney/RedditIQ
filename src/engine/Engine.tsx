import {  RedditAPIClient, RedisClient, User } from "@devvit/public-api";
import { GameSettings, PinnedPostData, PostId, PuzzlePostData, UserData, PostType } from "../types.js";

export type ScoreBoardEntry = {
    member: string;
    score: number;
    description?: string;
  };
  

export class Engine {



    static getLeaderboard( maxLength: number = 10): PromiseLike<ScoreBoardEntry[]> {
        throw new Error("Method not implemented.");
    }
    static getUserScore(username: string | null):  Promise<{ rank: number; score: number; }> {
        throw new Error("Method not implemented.");
    }
    addPuzzle(difficulty: any, data: any) {
        throw new Error('Method not implemented.');
    }


    
    constructor( context: {
        redis: RedisClient;
        reddit?: RedditAPIClient;
        scheduer?: any;
    }) {
        this.redis = context.redis;
        this.reddit = context.reddit;
        this.scheduer = context.scheduer;
    }

    

    readonly keys = {
        postData: (postId: PostId) => `posts:${postId}`,
        moves: (postId: PostId) => `moves:${postId}`,
        userData: (username: string) => `users:${username}`,
        postSolved: (postId: PostId) => `posts:${postId}:solved`,
        postSkipped: (postId: PostId) => `posts:${postId}:skipped`,
        gameSettings: 'game-settings',
        difficulties: 'difficulties',
        puzzle: (puzzleName: string) => `puzzle:${puzzleName}`,
        
    }



    async getPuzzlesDifficulties(): Promise<string[]> {

        const data = (
            await this.redis.zRange(this.keys.difficulties, 0, -1, {
                by: 'rank',
                reverse: true
            })) ?? [];
            
        return data.map( (value) => value.member)
    }
        

    /* 
    * Store Settings in Redis
    */

    async storeGameSettings(gameSettings: GameSettings): Promise<void> {
        
        const key = this.keys.gameSettings;
        await this.redis.hSet(key, gameSettings)

    }



    /*
    * Save Post In Reids
    */
    async createPinnedPost(postId: PostId): Promise<void> {
        
      const key = this.keys.postData(postId);

      await this.redis.hSet(key, {
            postId,
            postType: 'pinned'
        })

    }

    /*
    * Get Post Data
    */

    async getPinnedPost(postId: PostId): Promise<PinnedPostData> {
        
        const key = this.keys.postData(postId);
        const postType = await this.redis.hGet(key, "postType");

        return {
            postId: postId,
            postType: postType ?? "pinned",
        }



    }



    readonly redis: RedisClient;
    readonly reddit?: RedditAPIClient
    readonly scheduer?: any;








    /*
    * Save Puzzle into Redis
    */
    
    async savePuzzle(puzzleName: string, puzzle: number[]): Promise<void> {

        const json = JSON.stringify(puzzle);
        const key = this.keys.puzzle(puzzleName);

        await Promise.all([
            this.redis.set(key, json),
            this.redis.zAdd(this.keys.difficulties, {
                member: puzzleName,
                score: Date.now() 
            })
        ]);

    }


    /*
    * Get Puzzle Info for Board
    */

    getPuzzle(postId: PostId): number[][] {
        
        return [
            [0,0,0],
            [1,0,0],
            [0,1,0],
        ]

    }

    /*
    * Get User Data
    */

    async getUserData(username: string | null, postId: PostId): Promise<UserData | null> {
        
        if (!username) return null;

        const data = await this.redis.hGetAll(this.keys.userData(username))
        const solved = !!(await this.redis.zScore(this.keys.postSolved(postId), username))
        const skipped = !!(await this.redis.zScore(this.keys.postSkipped(postId), username))

        const userInfo : UserData = {
            score: parseInt(data.score),
            solved: solved || false,
            skipped : skipped || false,
        }

        return userInfo;

        
    }



    async getGameSettings(): Promise<GameSettings> {
        const key = this.keys.gameSettings;
        const settings = await this.redis.hGetAll(key);
        return settings as GameSettings; 
    }
  

    async getPostType(postId: PostId): Promise<PostType> {
        
        const key = this.keys.postData(postId);

        const postType = await this.redis.hGet(key, "postType");
        const defaultPostType = "pinned";

        return (postType ?? defaultPostType) as PostType



    }

    async getPuzzlePost(postId: PostId): Promise<PuzzlePostData> {

        const [postData, moves] = await Promise.all([
            this.redis.hGetAll(this.keys.postData(postId)), // get all fields of the hash
            this.redis.zCard(this.keys.moves(postId)) // get the number of pair
        ]);

        return {
            postId: postId,
            authorUsername: postData.authorUsername,
            date: parseInt(postData.date),
            postType: postData.postType ,
            puzzle: postData.puzzle,
            solves: moves,
            solution: postData.solution,
        }
    }        

}