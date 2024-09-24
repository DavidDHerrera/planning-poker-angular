// room.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Store } from '@ngrx/store';
import { setUserRole, setGameName } from '../store/game.actions';
import { AppState } from '../store/app.state';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private socket: Socket;
  private roomId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>
  ) {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect_error', (err: any) => {
      console.error('Error de conexión:', err);
    });
  }

  // Métodos relacionados con el socket
  onEvent(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data: any) => {
        observer.next(data);
      });
    });
  }

  emitEvent(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  // Métodos para manejo de usuario y sala
  setUser(name: string, role: string, isAdmin: boolean = false): void {
    if (isAdmin) {
      localStorage.setItem('adminName', name);
      localStorage.removeItem('playerName');
    } else {
      localStorage.setItem('playerName', name);
      localStorage.removeItem('adminName');
    }
    localStorage.setItem('userRole', role);

    this.store.dispatch(setUserRole({ role }));
  }

  setRoomId(roomId: string): void {
    this.roomId = roomId;
    localStorage.setItem('roomId', roomId);
  }

  getRoomId(): string | null {
    return this.roomId || localStorage.getItem('roomId');
  }

  setRoomName(roomName: string): void {
    localStorage.setItem('roomName', roomName);
    this.store.dispatch(setGameName({ gameName: roomName }));
  }

  // Método para generar un ID único para la sala
  generateRoomId(): string {
    const roomId = Math.random().toString(36).substring(2, 9);
    this.setRoomId(roomId);
    return roomId;
  }

  // Métodos para construir formularios con validaciones
  createGameForm(): FormGroup {
    return this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
          Validators.pattern(/^(?!.*[_.,*#/-])[\w\d ]+$/),
          this.maxNumbersValidator(3),
          this.noNumbersOnlyValidator(),
        ],
      ],
    });
  }

  createUserForm(nameField: string): FormGroup {
    return this.fb.group({
      [nameField]: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
          Validators.pattern(/^(?!.*[_.,*#/-])[\w\d ]+$/),
          this.maxNumbersValidator(3),
          this.noNumbersOnlyValidator(),
        ],
      ],
      mode: ['', Validators.required],
    });
  }

  // Validadores personalizados
  private maxNumbersValidator(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const numberCount = (value.match(/\d/g) || []).length;
      return numberCount <= max ? null : { maxNumbers: true };
    };
  }

  private noNumbersOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      return /^\d+$/.test(value) ? { noNumbersOnly: true } : null;
    };
  }
}
