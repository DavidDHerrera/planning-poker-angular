// join-room.component.ts
import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { setUserRole } from '../store/game.actions';
import { Router, ActivatedRoute } from '@angular/router'; // Asegúrate de importar ActivatedRoute
import { io } from 'socket.io-client';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class JoinRoomComponent {
  playerForm!: FormGroup;
  socket: any;
  callBack: EventEmitter<any> = new EventEmitter();
  roomId: string | null = null;  // ID de la sala que se extraerá de la URL

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute  // Para extraer parámetros de la URL
  ) {
    this.playerForm = this.fb.group({
      playerName: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^(?!.*[_.,*#/-])[\w\d ]+$/), // Letras, números y espacio, sin caracteres especiales
        this.maxNumbersValidator(3), // No más de 3 números
        this.noNumbersOnlyValidator() // No solo números
      ]],
      mode: ['', Validators.required] // Campo para el rol (jugador o espectador)
    });

    this.route.paramMap.subscribe(params => {
      this.roomId = params.get('roomId'); // Extraer el roomId de la URL si existe
      if (this.roomId) {
        localStorage.setItem('roomId', this.roomId); // Guardar solo si roomId no es null
      }
    });
  }

  ngOnInit() {
    // Obtener el roomId de la URL

    this.route.paramMap.subscribe(params => {
      this.roomId = params.get('roomId'); // Extraer el roomId de la URL si existe
      console.log(this.roomId);

    });

    this.socket = io('http://localhost:3000');
    this.socket.on('connect_error', (err: any) => {
      console.error('Error de conexión:', err);
    });



    // Escuchar la información de la sala cuando el servidor emite los detalles
    this.socket.on('roomDetails', (data: any) => {
      console.log('Datos de la sala recibidos del servidor:', data);
      const roomId = data.roomId;
      const roomName = data.roomName;

      localStorage.setItem('roomName', roomName);

      // Mostrar los detalles en el componente o almacenarlos para su uso posterior
      this.callBack.emit({ roomId, roomName });
    });

    // Escuchar si otros jugadores se unen
    this.socket.on('playerJoined', (data: any) => {
      console.log('Jugador se unió a la sala:', data.playerName);
      // Manejar la lógica para actualizar la lista de jugadores
    });
  }



  // Validadores personalizados
  get playerName() {
    return this.playerForm.get('playerName');
  }

  maxNumbersValidator(max: number) {
    return (control: any) => {
      const value = control.value || '';
      const numberCount = (value.match(/\d/g) || []).length;
      return numberCount <= max ? null : { maxNumbers: true };
    };
  }

  noNumbersOnlyValidator() {
    return (control: any) => {
      const value = control.value || '';
      return /^\d+$/.test(value) ? { noNumbersOnly: true } : null;
    };
  }

  onSubmit() {
    if (this.playerForm.valid) {
      const playerName = this.playerForm.value.playerName;
      const selectedRole = this.playerForm.value.mode;
      const roomId = this.roomId; // Asegúrate de que roomId tiene un valor

      if (!roomId) {
        console.log('Error: No se ha encontrado roomId');
        return;
      }

      console.log(`Uniéndose a la sala con roomId: ${roomId} y nombre: ${playerName}`);

      // Emitir al servidor la información del jugador que se une a la sala
      this.socket.emit('joinRoom', { playerName, role: selectedRole, roomId });

      // Guardar en localStorage
      localStorage.setItem('playerName', playerName);
      localStorage.setItem('userRole', selectedRole);

      // Actualizar el estado de la aplicación
      this.store.dispatch(setUserRole({ role: selectedRole }));

      console.log('Usuario jugador creado con nombre:', playerName, 'y rol:', selectedRole);

      // Redirigir al jugador a la mesa de juego
      this.router.navigate([`/game-table/${roomId}`]);
    }
  }

}
