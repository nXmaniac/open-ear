import * as _ from 'lodash';
import { Exercise } from '../../Exercise';
import {
  randomFromList,
  toNoteName,
  toArray,
  toNoteNumber,
  DeepReadonly,
  NotesRange,
} from '../../utility';
import { NoteNumber } from '../../utility/music/notes/NoteNumberOrName';
import { IntervalExerciseExplanationComponent } from "./interval-exercise-explanation/interval-exercise-explanation.component";
import { NoteEvent } from '../../../services/player.service';
import { Note } from 'tone/Tone/core/type/NoteUnits';
import { transpose } from '../../utility/music/transpose';
import { createExercise } from '../utility/base-exercises/BaseExercise';
import {
  IncludedAnswersSettings,
  includedAnswersSetting,
} from '../utility/settings/IncludedAnswersSettings';
import filterIncludedAnswers = Exercise.filterIncludedAnswers;

export type IntervalName = 'Minor 2nd' | 'Major 2nd' | 'Minor 3rd' | 'Major 3rd' | 'Perfect 4th' | 'Aug 4th' | 'Perfect 5th' | 'Minor 6th' | 'Major 6th' | 'Minor 7th' | 'Major 7th' | 'Octave';

export interface IIntervalDescriptor {
  name: IntervalName;
  semitones: number;
}

export type IntervalExerciseSettings = IncludedAnswersSettings<IntervalName>

export const intervalDescriptorList: DeepReadonly<IIntervalDescriptor[]> = [
  {
    name: 'Minor 2nd',
    semitones: 1,
  },
  {
    name: 'Major 2nd',
    semitones: 2,
  },
  {
    name: 'Minor 3rd',
    semitones: 3,
  },
  {
    name: 'Major 3rd',
    semitones: 4,
  },
  {
    name: 'Perfect 4th',
    semitones: 5,
  },
  {
    name: 'Aug 4th',
    semitones: 6,
  },
  {
    name: 'Perfect 5th',
    semitones: 7,
  },
  {
    name: 'Minor 6th',
    semitones: 8,
  },
  {
    name: 'Major 6th',
    semitones: 9,
  },
  {
    name: 'Minor 7th',
    semitones: 10,
  },
  {
    name: 'Major 7th',
    semitones: 11,
  },
  {
    name: 'Octave',
    semitones: 12,
  },
]

const intervalNameToIntervalDescriptor: Record<IntervalName, IIntervalDescriptor>  = _.keyBy(intervalDescriptorList, 'name') as Record<IntervalName, IIntervalDescriptor>;

export const intervalExercise = (): Exercise.IExercise<IntervalName, IntervalExerciseSettings> => {
  const allAnswersList = {
    rows: [
      ['Minor 2nd', 'Major 2nd'],
      ['Minor 3rd', 'Major 3rd'],
      ['Perfect 4th', 'Aug 4th', 'Perfect 5th'],
      ['Minor 6th', 'Major 6th'],
      ['Minor 7th', 'Major 7th'],
      ['Octave'],
    ].map((row: IntervalName[]) => row.map((interval: IntervalName) => {
      return {
        answer: interval,
        playOnClick: (question: Exercise.NotesQuestion<IntervalName>) => {
          const noteList: Note[] = toArray<NoteEvent | Note>(question.segments[0].partToPlay)
            .map((noteOrEvent): Note => {
              if (typeof noteOrEvent === 'object') {
                return toArray(noteOrEvent.notes)[0]; // assuming no harmonic notes
              } else {
                return noteOrEvent;
              }
            })
          const startNote: Note = _.first(noteList)!;
          const endNote: Note = _.last(noteList)!;
          const originalInterval: number = toNoteNumber(endNote) - toNoteNumber(startNote);
          const direction: 1 | -1 = originalInterval / Math.abs(originalInterval) as 1 | -1;
          return [
            startNote,
            transpose(startNote, direction * intervalNameToIntervalDescriptor[interval].semitones),
          ]
        },
      }
    })),
  };
  const range = new NotesRange('C3', 'E5');
  return createExercise({
    id: 'interval',
    name: 'Intervals',
    summary: 'Identify intervals chromatically (no key)',
    explanation: IntervalExerciseExplanationComponent,
    answerList: (settings: IntervalExerciseSettings) => filterIncludedAnswers(allAnswersList, settings.includedAnswers),
    getQuestion(settings: IntervalExerciseSettings): Exercise.Question<IntervalName> {
      const randomIntervalDescriptor: IIntervalDescriptor = randomFromList(intervalDescriptorList.filter(intervalDescriptor => settings.includedAnswers.includes(intervalDescriptor.name)));
      const randomStartingNoteNumber: NoteNumber = _.random(range.lowestNoteNumber, range.highestNoteNumber - randomIntervalDescriptor.semitones);
      const startNoteName = toNoteName(randomStartingNoteNumber);
      const endNoteName = toNoteName(randomStartingNoteNumber + randomIntervalDescriptor.semitones);
      return {
        segments: [{
          rightAnswer: randomIntervalDescriptor.name,
          partToPlay: _.shuffle([startNoteName, endNoteName]),
        }],
        info: {
          beforeCorrectAnswer: `Notes played: ${toNoteName(randomStartingNoteNumber)} - ?`,
          afterCorrectAnswer: `Notes played: ${startNoteName} - ${endNoteName}`,
        },
      }
    },
    ...includedAnswersSetting({
      answerList: allAnswersList,
      defaultSelectedAnswers: [
        'Minor 2nd',
        'Major 2nd',
        'Minor 3rd',
        'Major 3rd',
        'Perfect 4th',
        'Aug 4th',
        'Perfect 5th',
        'Minor 6th',
        'Major 6th',
        'Minor 7th',
        'Major 7th',
        'Octave',
      ],
    }),
  })
}
