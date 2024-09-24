import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoomService } from '../services/room.service';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-create-admin',
  templateUrl: './create-admin.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserFormComponent],
})
export class CreateAdminComponent {
  adminForm!: FormGroup;

  constructor(
    private roomService: RoomService,
    private router: Router
  ) {
    this.adminForm = this.roomService.createUserForm('adminName');
  }

  onFormSubmit() {
    if (this.adminForm.valid) {
      const adminName = this.adminForm.value.adminName;
      const selectedRole = this.adminForm.value.mode;

      this.roomService.setUser(adminName, selectedRole, true);

      console.log('Usuario administrador creado con nombre:', adminName, 'y rol:', selectedRole);

      const roomId = this.roomService.getRoomId();

      if (!roomId) {
        console.log('Error: No se ha encontrado roomId');
        return;
      }

      this.router.navigate([`/game-table/${roomId}`]);
    }
  }
}
