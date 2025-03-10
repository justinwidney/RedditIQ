// Learn more at developers.reddit.com/docs
import { Devvit, useState } from '@devvit/public-api';
import { Router } from './posts/Router.js';
import { installGame } from './actions/installGame.js';
import { addPuzzles } from './actions/addPuzzles.js';
import { addPuzzlesForm } from './forms/addPuzzleForm.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

Devvit.addCustomPostType({
  name: 'Chess Paint',
  description: 'A game to solve a moving puzzle with chess movements',
  height: 'tall',
  render: Router,
})


Devvit.addMenuItem(installGame)
Devvit.addMenuItem(addPuzzles(addPuzzlesForm))


export default Devvit;
