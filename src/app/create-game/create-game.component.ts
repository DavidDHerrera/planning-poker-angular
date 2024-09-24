import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class CreateGameComponent {
  gameForm!: FormGroup;

  constructor(
    private roomService: RoomService, // Inyectamos RoomService
    private router: Router,
    private store: Store<AppState> // Inyectamos Store para NgRx
  ) {
    this.gameForm = this.roomService.createGameForm();

    this.roomService.onEvent('createRoom').subscribe((data: any) => {
      console.log('Datos recibidos del servidor:', data);
      if (data) {
        console.log('Sala creada exitosamente en el servidor.');
      }
    });
  }

  // Getter para obtener el control de nombre
  get name() {
    return this.gameForm.get('name');
  }

  // Método para manejar el envío del formulario
  onSubmit() {
    if (this.gameForm.valid) {
      const roomName = this.gameForm.value.name;

      this.roomService.setRoomName(roomName);

      const roomId = this.roomService.generateRoomId();

      console.log('Room ID:', roomId);
      this.roomService.emitEvent('createRoom', {
        roomId: roomId,
        roomName: roomName,
      });

      console.log('Partida creada:', roomName);
      this.router.navigate(['/create-admin']);
    }
  }
}
