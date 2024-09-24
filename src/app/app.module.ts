import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateGameComponent } from './create-game/create-game.component';
import { HeaderComponent } from './header/header.component';
import { CreateAdminComponent } from './create-admin/create-admin.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { gameReducer } from './store/game.reducer';
import { GameTableComponent } from './game-table/game-table.component';
import { JoinRoomComponent } from './join-room/join-room.component';
import { UserFormComponent } from './user-form/user-form.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    GameTableComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CreateGameComponent,
    CreateAdminComponent,
    JoinRoomComponent,
    StoreModule.forRoot({}, {}),
    EffectsModule.forRoot([]),
    FormsModule,
    ReactiveFormsModule,
    UserFormComponent,
    StoreModule.forRoot({ gameName: gameReducer }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
