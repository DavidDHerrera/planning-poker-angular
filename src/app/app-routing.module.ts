import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateGameComponent } from './create-game/create-game.component';
import { CreateAdminComponent } from './create-admin/create-admin.component';

const routes: Routes = [
  { path: 'create-game', component: CreateGameComponent },
  { path: 'create-admin', component: CreateAdminComponent },  // Ruta para la HU 2
  { path: '', redirectTo: '/create-game', pathMatch: 'full' }  // Redirige a la pantalla inicial
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
