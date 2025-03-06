
/*
* Page Router
* Init router for main entry into the app
* Hangle data loading and routing
*/

import { Context, Devvit,  useState } from "@devvit/public-api";
import { PinnedPostData, PostId, PostType, PuzzlePostData, UserData } from "../types.js";
import { PinnedPost } from "./PinnedPost.js";
import { Engine } from "./engine/Engine.js";


export const Router: Devvit.CustomPostComponent = (context: Context) => {

    const postId = context.postId as PostId;

    const getUsername = async () => {
        if (!context.userId) return null;

        const cacheKey = `cache:userId-username`;

        const cache = await context.redis.hGet(cacheKey, context.userId);

        if (cache) {return cache;}
        else{
            const user = await context.reddit?.getUserById(context.userId);
            if (user) {
                await context.redis.hSet(cacheKey, {
                  [context.userId]: user.username,
                });
                return user.username;
              }
        }
        return null;
    }

    const gameEngine = new Engine(context)

    function getPostData(
        postType: PostType,
        postId: PostId
    ) : Promise<PuzzlePostData | PinnedPostData> {
    {
       switch(postType){
            case PostType.PINNED:
                return gameEngine.getPinnedPost(postId);
            case PostType.PUZZLE:
                return gameEngine.getPuzzlePost(postId);
            default:
                return gameEngine.getPuzzlePost(postId);
       }
    }
    }

    const [data] = useState<{
        postData: PuzzlePostData | PinnedPostData;
        postType: PostType;
        userData: UserData | null;
        username: string | null;
        gameSettings: Record<string, any> | null;
        puzzle: Record<string, any> | null;
    }>( async () => {
        
        const [postType, username] = await Promise.all([
            gameEngine.getPostType(postId),
            getUsername()]
        );

        const [postData, userData, gameSettings, puzzle] = await Promise.all([
            getPostData(postType, postId),
            gameEngine.getUser(username, postId),
            gameEngine.getGameSettings(),
            gameEngine.getPuzzle(postId)
        ]);

        return {
            postData,
            postType,
            userData,
            username,
            gameSettings,
            puzzle,
        }
    });
        

    const postTypes: Record<string, JSX.Element> = {
        pinned:(
            <PinnedPost
            postData ={data.postData}
            userData ={data.userData}
            username ={data.username}
            gameSettings ={data.gameSettings}
            puzzle = {data.puzzle}
            />
        )
        }

    return (
        <zstack width="100%" height="100%" alignment="top start">
            <image 
            imageHeight={1024}
            imageWidth={2048}
            height="100%"
            width="100%"
            url="background.png"
            description="custom background"
            resizeMode="cover"  
            />
            {postTypes[data.postType] || <text>Post type not found</text>}

        </zstack>
    )
}