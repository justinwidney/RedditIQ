import { Devvit, FormKey, MenuItem } from "@devvit/public-api";
import { Engine } from "../engine/Engine.js";
import { LoadingPreview } from "../utils/loadingPreview.js";
import { GameSettings } from "../types.js";
import Settings from "../Settings.json";




export const dailyPost = (form: FormKey): MenuItem => ({
    label: '[Pixelary] Create dictionary',
    location: 'subreddit',
    forUserType: 'moderator',
    onPress: async (_event, context) => {
      context.ui.showForm(form);
    },
  });


  function formatDateDMY(timestamp: number) {
    const date = new Date(timestamp);
    
    // Get day, month, and year
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    
    // Return in DD-MM-YYYY format
    return `${day}-${month}-${year}`;
  }
  



export const newPinnedPost: MenuItem = {
  label: '[Reddit IQ] New daily post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {

    const engine = new Engine(context);
    const community = await context.reddit.getCurrentSubreddit();
    const todayDate = new Date().toLocaleDateString();

    const title = 'Seinfield'

    const post = await context.reddit.submitPost({
      title: `Reddit IQ - ${title}`,
      subredditName: community.name,
      preview: <LoadingPreview />,
    });

    const gameSettings = {
      subredditName: community.name,
      questions: Settings.questions,
      title: title,
      fileName: `../../data/Questions/March/${title}}.json`
    }

    engine.storeGameSettings(gameSettings as GameSettings),


  await Promise.all([
    engine.createPinnedPost(post.id),
    engine.storePostSettings(post.id,  gameSettings)
  ])

    context.ui.navigateTo(post),
    context.ui.showToast("Game Installed")



    context.ui.navigateTo(post);
  },
};

  