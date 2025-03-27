import {  RedditAPIClient, RedisClient, Scheduler, User } from "@devvit/public-api";
import { GameSettings, PinnedPostData, PostId, PuzzlePostData, UserData, PostType, usernameID, GameType, GameScoreData } from "../types.js";
import Settings from "../Settings.json"
import { PostData } from "../components/SolvePageRouter.js";
import { Devvit } from '@devvit/public-api';

export type ScoreBoardEntry = {
    member: string;
    score: number;
    description?: string;
  };
  

export class Engine {

    readonly redis: RedisClient;
    readonly reddit?: RedditAPIClient
    readonly scheduler?: Scheduler;

    constructor( context: {
        redis: RedisClient;
        reddit?: RedditAPIClient;
        scheduler?: Scheduler;
    }) {
        this.redis = context.redis;
        this.reddit = context.reddit;
        this.scheduler = context.scheduler;
    }

    readonly tags = {
        scores: 'default',
        IQ: 'default',
      };

      readonly keys = {
        postData: (postId: PostId) => `posts:${postId}`,
        moves: (postId: PostId) => `moves:${postId}`,
        userData: (username: string) => `users:${username}`,
        postSolved: (postId: PostId) => `posts:${postId}:solved`,
        postSkipped: (postId: PostId) => `posts:${postId}:skipped`,
        gameSettings: 'game-settings',
        postSettings: (postId: PostId) => `posts:${postId}:settings`,
        difficulties: 'difficulties',
        puzzle: (puzzleName: string) => `puzzle:${puzzleName}`,
        postUserGuessCounter: (postId: PostId) => `user-guess-counter:${postId}`,
        scores: `score:${this.tags.scores}`,
        postIQ: (postId: PostId) => `posts:${postId}:IQ`,
        guessScores: (postId: string) => `post:${postId}:guessScores`
    }


    // Return Completed Play Counts

    async getPlayerCount(postId: PostId): Promise<number> {
        const key = this.keys.postUserGuessCounter(postId);
        return await this.redis.zCard(key);
      }
      

      /***
       * 
       *  Save gueses for a postID
       *  user -> guess
       */
      async saveGuessScore<T extends GameType>(
        postId: PostId, 
        guess: GameScoreData[T][], 
        username: string
      ): Promise<void> {
        await this.redis.hSet(this.keys.guessScores(postId), { [username]: guess.join(',') });
      }


      /**
     * Clears all guess scores for a specific post
     * @param postId The ID of the post to clear guesses for
     * @returns Promise resolving to true if successful
     */
    async clearGuessScores(postId: PostId): Promise<boolean> {
      const key = this.keys.guessScores(postId);      
      const result = await this.redis.del(key);      
      return true;
    }

      /***
       * Get guesses for postID
       */

      async getGuessScores(postId: PostId): Promise<{ [guess: string]: string[] }> {
        const key = this.keys.guessScores(postId);
        const data = await this.redis.hGetAll(key);

        const parsedData: { [guess: string]: usernameID[] } = {};
        Object.entries(data).forEach(([guess, commentId]) => {
          if (!parsedData[guess]) {
            parsedData[guess] = [];
          }
          parsedData[guess].push(commentId as usernameID);
        });
    
        return parsedData;
      }
  

      /**
       * Get the guess for a userID on a postID
       */

      async getGuessScore(postId: PostId, username: string): Promise<string | undefined> {
        const key = this.keys.guessScores(postId);
        return await this.redis.hGet(key, username);
    }
    


      /**
       * 
       * increment the user's guess count
       * save the postID to the user's solved list
       * get the user's score
       * save the guess
       */

      async submitGuess<T extends GameType>(event: {
        postData: PostData ;
        username: string;
        guess: GameScoreData[T][], 
        IQ: number;
        }): Promise<number> {

        if (!this.reddit || !this.scheduler) {
          console.error('Reddit API client or Scheduler not available in Service');
          return 0;
        } 

          const IQ = event.IQ;

        await Promise.all([

          this.redis.zIncrBy(
              this.keys.postUserGuessCounter(event.postData.postId),
              event.username, // Member
              1, // Score increment
            ),
                            
          // Save the postID to the user's solved list
           this.redis.zAdd(this.keys.postSolved(event.postData.postId), {
              member: event.username,
              score: Date.now(),
           }),

          this.incrementUserScore(event.username, IQ), // Total IQ,

          this.savePostIQ(event.postData.postId, event.username, IQ), // IQ for the post

          this.saveGuessScore(event.postData.postId, event.guess, event.username)
        ]);

        return IQ;
      }


      /**
       * get the user's score
       * increment the user's score
       */

      async incrementUserScore(username: string, IQ: number): Promise<number> {

        if (this.scheduler === undefined) {
          console.error('Scheduler not available in Service');
          return 0;
        }

        const key = this.keys.scores;

        const prevScore = (await this.redis.zScore(key, username)) ?? 0;
        const diffAmount = (IQ - prevScore)/2;
        const nextScore = await this.redis.zIncrBy(key, username, diffAmount)

      
        return nextScore;

    }

    
    /**
     * Users IQ Section
    */

    async savePostIQ(postId: PostId, username: string, iqScore: number): Promise<void> {
      const key = this.keys.postIQ(postId);
      const score = iqScore.toLocaleString()
      await this.redis.hSet(key, { [username]: score });
    }

    async getPostIQ(postId: PostId, username: string): Promise<number> {

      const key = this.keys.postIQ(postId);
      const data = await this.redis.hGet(key, username);
      return data ? parseInt(data) : 0;
    }

    async getAllPostIQ(postId: PostId): Promise<{ [username: string]: number }> {
      const key = this.keys.postIQ(postId);
      const data = await this.redis.hGetAll(key);
      const parsedData: { [username: string]: number } = {};
      Object.entries(data).forEach(([username, score]) => {
        parsedData[username] = parseInt(score);
      });
      return parsedData;
    }

    async getTotalIQ(username: string): Promise<number> {
      const key = this.keys.scores;
      const prevScore = (await this.redis.zScore(key, username)) ?? 0;
      return prevScore;
    }


    static getLeaderboard( maxLength: number = 10): PromiseLike<ScoreBoardEntry[]> {
        throw new Error("Method not implemented.");
    }


    async getUserScore(username: string | null): Promise<{
        rank: number;
        score: number;
      }> {
        const defaultValue = { rank: -1, score: 0 };
        if (!username) return defaultValue;
      
          const [rank, score] = await Promise.all([  
            this.redis.zRank(this.keys.scores, username),
            this.redis.zScore(this.keys.scores, username),
          ]);

          return {
            rank: rank === undefined ? -1 : rank,
            score: score === undefined ? 0 : score,
          };
       
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

    async storePostSettings(postId: PostId, gameSettings: GameSettings): Promise<void> {

        const key = this.keys.postSettings(postId);
        await this.redis.hSet(key, gameSettings)

    }
        
    async getPostSettings(postId: PostId): Promise<GameSettings> {
        const key = this.keys.postSettings(postId);
        const settings = await this.redis.hGetAll(key);
        
        return settings as GameSettings; 
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
  

    /*
    * Get Post Type
    */

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