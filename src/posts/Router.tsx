
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
        postSettings: GameSettings;
    }>( async () => {
        
        const [postType, username] = await Promise.all([
            gameEngine.getPostType(postId),
            getUsername()]
        );

        const [postData, userData,  postSettings] = await Promise.all([
            getPostData(postType, postId),
            gameEngine.getUserData(username, postId),
            gameEngine.getPostSettings(postId)
        ]);



        return {
            postData,
            postType,
            userData,
            username,
            postSettings
        }
    });
        
    const backgroundURL = data.postSettings.title + ".png";


    const postTypes: Record<string, JSX.Element> = {

        pinned:(
            <PinnedPost
                postData={data.postData}
                userData={data.userData}
                username={data.username} 
                postSettings={data.postSettings}       
                  />
        )
        }

    return (
        <zstack width="100%" height="100%" alignment="center middle" backgroundColor="#EAEAEA">
       
            {postTypes[data.postType] || <text>Post type not found</text>}




        </zstack>
    )
}