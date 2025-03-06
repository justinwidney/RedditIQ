import { RedditAPIClient, RedisClient, User } from "@devvit/public-api";
import { GameSettings, PinnedPostData, PostId, PuzzlePostData, UserData } from "../../types.js";



export class Engine {


    
    readonly keys = {
        postData: (postId: PostId) => `posts:${postId}`,
        moves: (postId: PostId) => `moves:${postId}`,
        userData: (username: string) => `users:${username}`,
        postSolved: (postId: PostId) => `posts:${postId}:solved`,
        postSkipped: (postId: PostId) => `posts:${postId}:skipped`,
        gameSettings: 'game-settings'
        
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
  
    readonly redis: RedisClient;
    readonly reddit?: RedditAPIClient
    readonly scheduer?: any;


    constructor( context: {
        redis: RedisClient;
        reddit?: RedditAPIClient;
        scheduer?: any;
    }) {
        this.redis = context.redis;
        this.reddit = context.reddit;
        this.scheduer = context.scheduer;
    }



    async getPinnedPost(postId: PostId): Promise<PinnedPostData> {
        
        const key = this.keys.postData(postId);
        const postType = await this.redis.hGet(key, "postType");

        return {
            postId: postId,
            postType: postType ?? "pinned",
        }



    }

    getPostType(postId: any): any {
        throw new Error("Method not implemented.");
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