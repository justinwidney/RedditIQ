
/*
* Page Router
* Init router for main entry into the app
* Hangle data loading and routing
*/

import { Context, Devvit,  useState } from "@devvit/public-api";
import { GameSettings, PinnedPostData, PostId, PostType, PuzzlePostData, UserData } from "../types.js";
import { PinnedPost } from "./PinnedPost/PinnedPost.js";
import { Engine } from "../engine/Engine.js";
import { PuzzlePost } from "./PuzzlePost/PuzzlePost.js";


export const Router: Devvit.CustomPostComponent = (context: Context) => {

    const postId = context.postId as PostId;
    const gameEngine = new Engine(context)

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
                return gameEngine.getPinnedPost(postId);
       }
    }
    }


    const [data] = useState<{
        postData: PuzzlePostData | PinnedPostData;
        postType: PostType;
        userData: UserData | null;
        username: string | null;
        gameSettings: GameSettings;
    }>( async () => {
        
        const [postType, username] = await Promise.all([
            gameEngine.getPostType(postId),
            getUsername()]
        );

        const [postData, userData, gameSettings] = await Promise.all([
            getPostData(postType, postId),
            gameEngine.getUserData(username, postId),
            gameEngine.getGameSettings(),
        ]);

        return {
            postData,
            postType,
            userData,
            username,
            gameSettings,
        }
    });
        
    

    const postTypes: Record<string, JSX.Element> = {

        pinned:(
            <PinnedPost
                postData={data.postData}
                userData={data.userData}
                username={data.username} 
                gameSettings={data.gameSettings }          
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
            url="Windows_Screen.png"
            description="custom background"
            resizeMode="cover"  
            />
            {postTypes[data.postType] || <text>Post type not found</text>}

        </zstack>
    )
}