/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, type Dispatch, type PropsWithChildren } from 'react';
import { initialJourneyState, journeyReducer, type JourneyAction, type JourneyState } from './journeyReducer';
const JourneyContext = createContext<{ state: JourneyState; dispatch: Dispatch<JourneyAction> } | null>(null);
export function JourneyProvider({ children }: PropsWithChildren) { const [state, dispatch] = useReducer(journeyReducer, initialJourneyState); return <JourneyContext.Provider value={{ state, dispatch }}>{children}</JourneyContext.Provider>; }
export function useJourney() { const value = useContext(JourneyContext); if (!value) throw new Error('useJourney must be inside JourneyProvider'); return value; }
