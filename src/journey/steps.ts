export const JOURNEY_STEPS = ['LanguageSelect','Intro','Setup','Prediction','Run','Result','Replay','Reveal','Debrief','PostCheck','NextSteps'] as const;
export type JourneyStep = (typeof JOURNEY_STEPS)[number];
export const stepNumber = (step: JourneyStep) => JOURNEY_STEPS.indexOf(step);
