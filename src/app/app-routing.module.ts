import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateGameComponent } from './create-game/create-game.component';
import { CreateAdminComponent } from './create-admin/create-admin.component';
import { GameTableComponent } from './game-table/game-table.component';
import { JoinRoomComponent } from './join-room/join-room.component';

const routes: Routes = [
  { path: 'create-game', component: CreateGameComponent },
  { path: 'create-admin', component: CreateAdminComponent },
  { path: 'create-admin/:roomId', component: CreateAdminComponent },
  { path: 'create-player/:roomId', component: JoinRoomComponent },
  { path: 'game-table/:roomId', component: GameTableComponent },
  { path: '', redirectTo: '/create-game', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
