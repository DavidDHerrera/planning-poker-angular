import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class UserFormComponent {

  @Input() formGroup!: FormGroup;
  @Input() nameControlName!: string; // Nombre del control para el input de nombre
  @Input() submitButtonText: string = 'Continuar'; // Texto del botón de enviar

  @Output() formSubmit = new EventEmitter<void>();

  cards: string[] = ['0', '1', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];
  onSubmit() {
    this.formSubmit.emit();
  }
}
