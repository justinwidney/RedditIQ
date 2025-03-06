
/*
* Page Router
* Init router for main entry into the app
* Hangle data loading and routing
*/

import { Context, Devvit, useState } from "@devvit/public-api";
import { PostId } from "../types.js";
import { PinnedPost } from "./PinnedPost.js";
import { Engine } from "./engine/Engine.js";


export const Router: Devvit.CustomPostComponent = (context: Context) => {

    const postID = context.postId as PostId;

    const gameEngine = new Engine(context)

    function getPostData(
        postType: string,
        postID: PostId
    ){
        return {
            postID: postID,
           postType: 'pinned',
           data : JSON.parse("data.json"),
           timeframe: "today"
        }
    }

    const [data] = useState<{
        postData: Record<string, any>;
        postType: string;
        userData: Record<string, any> | null;
        username: string | null;
        gameSettings: Record<string, any> | null;
        puzzle: Record<string, any> | null;
    }>({
        postData: {},
        postType: "pinned",
        userData: null,
        username: null,
        gameSettings: null,
        puzzle: null
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