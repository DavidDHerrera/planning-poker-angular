import { createAction, props } from '@ngrx/store';

export const setGameName = createAction(
  '[Game] Set Game Name',
  props<{ gameName: string }>()
);

export const setUserRole = createAction(
    '[User] Set User Role',
    props<{ role: string }>()  // Define la acción para actualizar el rol del usuario
  );