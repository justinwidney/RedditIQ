import { Devvit, MenuItem } from "@devvit/public-api";
import { Engine } from "../engine/Engine.js";
import Settings  from "../Settings.json";
import { GameSettings } from "../types.js";
import { LoadingPreview } from "../utils/loadingPreview.js";




/*
* Install Game and store Setting 
*/

export const installGame: MenuItem = {

    label: "Install Game",
    location: 'subreddit',
    forUserType: 'moderator',
 

    onPress: async (_event, context) => {
        const {ui, reddit} = context;
        const service = new Engine(context);
        const community = await reddit.getCurrentSubreddit();

        const post = await reddit.submitPost({
            subredditName: community.name,
            title : Settings.pinnedPost.title,
            preview: <LoadingPreview />,
        })

        await Promise.all([
            post.sticky(),  
            service.createPinnedPost(post.id),
            service.storeGameSettings({
                subredditName: community.name,
                questions: Settings.questions,
            } as GameSettings),
            ui.navigateTo(post),
            ui.showToast("Game Installed")

        ])

    }
}
