import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { setGameName } from '../store/game.actions'; // Acción de NgRx
import { AppState } from '../store/app.state';
import { io } from 'socket.io-client'; // Socket.IO para conexión en tiempo real

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class CreateGameComponent {
  gameForm!: FormGroup;
  socket: any; // Para manejar la conexión con el servidor
  roomId: string = ''; // ID de la sala creada
  callBack: EventEmitter<any> = new EventEmitter()

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: Store<AppState>, // Inyectamos Store para NgRx
  ) {
    this.gameForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^(?!.*[_.,*#/-])[\w\d ]+$/), // Permite letras, dígitos y espacio
        this.maxNumbersValidator(3), // No más de 3 números
        this.noNumbersOnlyValidator() // No puede ser solo números
      ]]
    });

    // Conectar al servidor de Socket.IO
    this.socket = io('http://localhost:3000'); // Dirección del servidor local

    // Escuchar los eventos enviados por el servidor
    this.socket.on('createRoom', (data: any) => {
      console.log('Datos recibidos del servidor:', data);
      // Puedes usar EventEmitter para propagar los datos
      this.callBack.emit(data);

      // O manejar la lógica directamente en este componente
      if (data) {
        console.log('Sala creada exitosamente en el servidor.');
      }
    });
  }

  // Getter para obtener el control de nombre
  get name() {
    return this.gameForm.get('name');
  }

  // Validador personalizado para limitar la cantidad de números en el nombre
  maxNumbersValidator(max: number) {
    return (control: any) => {
      const value = control.value || '';
      const numberCount = (value.match(/\d/g) || []).length;
      return numberCount <= max ? null : { maxNumbers: true };
    };
  }

  // Validador personalizado para evitar nombres compuestos solo por números
  noNumbersOnlyValidator() {
    return (control: any) => {
      const value = control.value || '';
      return /^\d+$/.test(value) ? { noNumbersOnly: true } : null;
    };
  }

  // Método para manejar el envío del formulario
  onSubmit() {
    if (this.gameForm.valid) {
      const roomName = this.gameForm.value.name;

      // Guardar nombre de usuario en localStorage
      localStorage.setItem('roomName', roomName);

      // Crear una sala y almacenar el ID de la sala
      this.roomId = this.generateRoomId();
      localStorage.setItem('roomId', this.roomId);

      console.log(this.roomId);

      // Informar al servidor de la creación de la sala
      this.socket.emit('createRoom', {
        roomId: this.roomId,
        roomName: roomName
      });

      // Dispatch a la store con NgRx para manejar el estado global
      this.store.dispatch(setGameName({ gameName: roomName }));

      console.log('Partida creada:', roomName);

      // Redirigir al administrador a la sala
      this.router.navigate(['/create-admin']);
    }
  }

  // Método para generar un ID único para la sala
  generateRoomId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}
