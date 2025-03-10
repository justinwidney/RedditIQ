import type { FormKey, MenuItem } from '@devvit/public-api';
import { Engine } from '../engine/Engine.js';


export const addPuzzles = (form: FormKey): MenuItem => ({

    label: 'Add Puzzles',
    location: 'subreddit',
    forUserType: 'moderator',
    onPress: async (event, context) =>{

        const engine = new Engine(context)
        const [puzzles, gameSetings] = await Promise.all([
            engine.getPuzzlesDifficulties(),
            engine.getGameSettings()
        ])

        context.ui.showForm(form, {
            puzzles,
            selectedPuzzle: gameSetings.subredditName
        })
    }



})