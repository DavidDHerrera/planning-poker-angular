import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['./create-game.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class CreateGameComponent {
  gameForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.gameForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^(?!.*[_.,*#/-])[\w\d ]+$/), // Permite letras, dígitos y espacio, excluyendo caracteres especiales
        this.maxNumbersValidator(3), // No más de 3 números
        this.noNumbersOnlyValidator() // No puede ser solo números
      ]]
    });
  }

  get name() {
    return this.gameForm.get('name');
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
    if (this.gameForm.valid) {
      console.log('Partida creada:', this.gameForm.value);
    }
  }
}
