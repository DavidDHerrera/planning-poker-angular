import { createReducer, on } from '@ngrx/store';
import { setGameName, setUserRole  } from './game.actions';

export interface GameState {
    gameName: string;
    userRole: string;
  }

  export const initialState: GameState = {
    gameName: '',
    userRole: ''  // Inicializamos el rol vacío
  };

  export const gameReducer = createReducer(
    initialState,
    on(setGameName, (state, { gameName }) => ({ ...state, gameName })),
    on(setUserRole, (state, { role }) => ({ ...state, userRole: role }))
  );
