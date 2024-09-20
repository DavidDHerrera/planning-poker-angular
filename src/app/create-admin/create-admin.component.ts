import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';  // Asegúrate de importar tu AppState
import { setUserRole } from '../store/game.actions';  // Acción para actualizar el rol del usuario
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-admin',
  templateUrl: './create-admin.component.html',
  styleUrls: ['./create-admin.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class CreateAdminComponent {
  adminForm!: FormGroup;

  constructor(private fb: FormBuilder, private store: Store<AppState>, private router: Router) {
    this.adminForm = this.fb.group({
      adminName: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^(?!.*[_.,*#/-])[\w\d ]+$/), // Letras, números y espacio, sin caracteres especiales
        this.maxNumbersValidator(3), // No más de 3 números
        this.noNumbersOnlyValidator() // No solo números
      ]],
      mode: ['', Validators.required] // Campo para el rol (jugador o espectador)
    });
  }

  get adminName() {
    return this.adminForm.get('adminName');
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
    if (this.adminForm.valid) {
      const adminName = this.adminForm.value.adminName;
      const selectedRole = this.adminForm.value.mode;

      // Guardar en localStorage
      localStorage.setItem('adminName', adminName);
      localStorage.setItem('userRole', selectedRole);

      this.store.dispatch(setUserRole({ role: selectedRole }));

      console.log('Usuario administrador creado con nombre:', adminName, 'y rol:', selectedRole);
      const roomId = localStorage.getItem('roomId');
      // Redirigir a la página de la mesa
      this.router.navigate([`/game-table/${roomId}`]);
    }
  }

}
