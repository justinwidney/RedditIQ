import { Devvit, FormOnSubmitEvent } from '@devvit/public-api';
import { Engine } from '../engine/Engine.js';


// Define the output type for form submissions
type PuzzleFormValues = {
    difficulty: string;
    puzzle: string;
  };
  
  export const addPuzzlesForm = Devvit.createForm(
    (data: any) => ({
      title: 'Add Puzzles',
      description: 'Add puzzles to your subreddit',
      fields: [
        {
          type: 'select',
          label: 'Difficulty',
          name: 'difficulty',
          options: data.difficulties?.map((difficulty: string) => ({label: difficulty, value: difficulty})) || [],
          defaultValue: [data.selectedDifficulty ?? 'easy'],
          required: true
        },
        {
          type: 'paragraph',
          name: 'puzzle',
          label: 'Puzzle',
          required: true,
          helpText: 'Add in the form of [-1, 0, 1, 0, 0, 0, 0, 0, 0]',
        },
      ],
      acceptLabel: 'Add Puzzle',
      cancelLabel: 'Cancel',
    }),
    async (event: FormOnSubmitEvent<any>, context) => {
      const addedPuzzle = event.values.puzzle.split(',').map(Number);
      const engine = new Engine(context);
      await engine.savePuzzle(event.values.difficulty, addedPuzzle);
    }
  );