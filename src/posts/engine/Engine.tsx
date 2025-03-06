import { RedditAPIClient, RedisClient } from "@devvit/public-api";
import { PinnedPostData, PostId } from "../../types.js";



export class Engine {
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

    readonly keys = {
        postData: (postId: PostId) => `posts:${postId}`,
    }


    async getPinnedPost(postId: PostId): Promise<PinnedPostData> {
        
        const key = this.keys.postData(postId);
        const postType = await this.redis.hGet(key, "postType");

        return {
            postId: postId,
            postType: postType ?? "pinned",
        }



    }



}