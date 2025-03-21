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
      };

      readonly keys = {
        postData: (postId: PostId) => `posts:${postId}`,
        moves: (postId: PostId) => `moves:${postId}`,
        userData: (username: string) => `users:${username}`,
        postSolved: (postId: PostId) => `posts:${postId}:solved`,
        postSkipped: (postId: PostId) => `posts:${postId}:skipped`,
        gameSettings: 'game-settings',
        difficulties: 'difficulties',
        puzzle: (puzzleName: string) => `puzzle:${puzzleName}`,
        postUserGuessCounter: (postId: PostId) => `user-guess-counter:${postId}`,
        scores: `score:${this.tags.scores}`,
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
        guess: GameScoreData[T], 
        username: string
      ): Promise<void> {
        await this.redis.hSet(this.keys.guessScores(postId), { [username]: guess });
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
        guess: GameScoreData[T], 
        }): Promise<number> {

        if (!this.reddit || !this.scheduler) {
          console.error('Reddit API client or Scheduler not available in Service');
          return 0;
        }

            // Increment the user's guess count
            this.redis.zIncrBy(
              this.keys.postUserGuessCounter(event.postData.postId),
              event.username, // Member
              1, // Score increment
            )
                
          const userPoints = 1;

           this.redis.zAdd(this.keys.postSolved(event.postData.postId), {
              member: event.username,
              score: Date.now(),
           })
      

          this.incrementUserScore(event.username, userPoints)
          this.saveGuessScore(event.postData.postId, event.guess, event.username);

        return userPoints;
      }


      /**
       * get the user's score
       * increment the user's score
       */

      async incrementUserScore(username: string, amount: number): Promise<number> {

      if (this.scheduler === undefined) {
        console.error('Scheduler not available in Service');
        return 0;
      }
      const key = this.keys.scores;
      //const prevScore = (await this.redis.zScore(key, username)) ?? 0;
      const nextScore = await this.redis.zIncrBy(key, username, amount)
     
  
      return nextScore;
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
        try {
          const [rank, score] = await Promise.all([
  
            this.redis.zRank(this.keys.scores, username),
            // TODO: Remove .zScore when .zRank supports the WITHSCORE option
            this.redis.zScore(this.keys.scores, username),
          ]);
          return {
            rank: rank === undefined ? -1 : rank,
            score: score === undefined ? 0 : score,
          };
        } catch (error) {
          if (error) {
            console.error('Error fetching user score board entry', error);
          }
          return defaultValue;
        }
      }


    addPuzzle(difficulty: any, data: any) {
        throw new Error('Method not implemented.');
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