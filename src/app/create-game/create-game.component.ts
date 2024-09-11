import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { setGameName } from '../store/game.actions'; // Acción de NgRx
import { AppState } from '../store/app.state';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class CreateGameComponent {
  gameForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private store: Store<AppState> // Inyectamos Store para NgRx
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
      const playerName = this.gameForm.value.name;

      localStorage.setItem('playerName', playerName);

      this.store.dispatch(setGameName({ gameName: playerName }));

      console.log('Partida creada:', playerName);
      this.router.navigate(['/create-admin']);
    }
  }
}
