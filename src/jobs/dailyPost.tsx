import { Devvit, MenuItem } from "@devvit/public-api";
import { Engine } from '../engine/Engine.js';
import { LoadingPreview } from '../utils/loadingPreview.js';
import { GameSettings } from "../types.js";
import Settings from '../Settings.json';


const DAILY_POST_JOB = 'dailyPost';



export const dailyPost = Devvit.addSchedulerJob({
    name: DAILY_POST_JOB,
    onRun: async (event, context) => {
        try {

            const {ui, reddit} = context;

            const community = await reddit.getCurrentSubreddit();
            const service = new Engine(context);
            
            // Create a new post
             const post = await reddit.submitPost({
            subredditName: community.name,
            title: `Daily Reddit IQ Game Post - ${new Date().toLocaleDateString()}`,
            preview: <LoadingPreview />,
             })
            
            // Store post data
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

            // Schedule the next daily post
            //await context.scheduler.runJob({
            //    name: DAILY_POST_JOB,
            //    data: {
            //        subredditName,
            //     },
            //    runAt: getNextRunTime(),
            //});
            
            console.log(`Created daily post: ${post.id}`);
        } catch (error) {
            console.error('Error creating daily post:', error);
        }
    },
});
