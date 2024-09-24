import { Component, EventEmitter, OnInit, Output  } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../services/room.service';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserFormComponent],
})
export class JoinRoomComponent implements OnInit {
  playerForm!: FormGroup;
  roomId: string | null = null;
  @Output() callBack: EventEmitter<any> = new EventEmitter();

  constructor(
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.playerForm = this.roomService.createUserForm('playerName');

    this.route.paramMap.subscribe((params) => {
      this.roomId = params.get('roomId');
      if (this.roomId) {
        this.roomService.setRoomId(this.roomId);
      }
    });
  }

  ngOnInit() {
    this.roomService.onEvent('roomDetails').subscribe((data) => {
      console.log('Datos de la sala recibidos del servidor:', data);
      const { roomId, roomName } = data;
      localStorage.setItem('roomName', roomName);
      this.callBack.emit({ roomId, roomName });
    });

    this.roomService.onEvent('playerJoined').subscribe((data) => {
      console.log('Jugador se unió a la sala:', data.playerName);
    });
  }

  get playerName() {
    return this.playerForm.get('playerName');
  }

  onFormSubmit() {
    if (this.playerForm.valid) {
      const playerName = this.playerForm.value.playerName;
      const selectedRole = this.playerForm.value.mode;
      const roomId = this.roomId;

      if (!roomId) {
        console.log('Error: No se ha encontrado roomId');
        return;
      }

      console.log(`Uniéndose a la sala con roomId: ${roomId} y nombre: ${playerName}`);

      this.roomService.emitEvent('joinRoom', { playerName, role: selectedRole, roomId });

      this.roomService.setUser(playerName, selectedRole);

      console.log('Usuario jugador creado con nombre:', playerName, 'y rol:', selectedRole);

      this.router.navigate([`/game-table/${roomId}`]);
    }
  }
}
