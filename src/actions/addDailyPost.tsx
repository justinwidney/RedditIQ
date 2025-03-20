import { Devvit, FormKey, MenuItem } from "@devvit/public-api";
import { Engine } from "../engine/Engine.js";
import { LoadingPreview } from "../utils/loadingPreview.js";
import { GameSettings } from "../types.js";
import Settings from "../Settings.json";


const DAILY_POST_JOB = 'dailyPost';


export const dailyPost = (form: FormKey): MenuItem => ({
    label: '[Pixelary] Create dictionary',
    location: 'subreddit',
    forUserType: 'moderator',
    onPress: async (_event, context) => {
      context.ui.showForm(form);
    },
  });








export const newPinnedPost: MenuItem = {
  label: '[Reddit IQ] New daily post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {

    const engine = new Engine(context);
    const community = await context.reddit.getCurrentSubreddit();
    const todayDate = new Date().toLocaleDateString();

    const post = await context.reddit.submitPost({
      title: `Reddit IQ Game ${todayDate}`,
      subredditName: community.name,
      preview: <LoadingPreview />,
    });

    //await post.sticky();
    //await engine.createPinnedPost(post.id);

    engine.storeGameSettings({
      subredditName: community.name,
      questions: Settings.questions,
  } as GameSettings),

  await Promise.all([
    engine.createPinnedPost(post.id),

    engine.storeGameSettings({
        subredditName: community.name,
        questions: Settings.questions,
    } as GameSettings),

    context.ui.navigateTo(post),
    context.ui.showToast("Game Installed")

])

    context.ui.navigateTo(post);
  },
};

  