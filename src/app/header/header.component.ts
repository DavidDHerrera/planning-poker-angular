import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  showGameTableInfo = false;
  gameName: string = '';
  roomName: string = '';
  playerInitials: string = '';
  isGameTablePage: boolean = false;  // Variable para la clase extra
  roomId: string | null = null;
  showInviteModal = false; // Controlar la visibilidad del modal
  inviteLink: string = '';
  showMenu = false; // Controla la visibilidad del menú desplegable
  isSpectator = false; // Variable para el modo espectador
  socket: any;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.socket = io('http://localhost:3000');

    this.router.events.subscribe(() => {
      const roomId = localStorage.getItem('roomId');

      // Si la URL es 'game-table', mostramos la información personalizada
      this.showGameTableInfo = this.router.url === `/game-table/${roomId}`;
      this.isGameTablePage = this.showGameTableInfo;  // Agregamos la clase extra

      // Obtener el nombre de la partida y el jugador del localStorage si estamos en 'game-table'
      if (this.showGameTableInfo) {
        this.gameName = localStorage.getItem('roomName') || 'Nombre de la Partida';
        this.roomName = localStorage.getItem('adminName') || localStorage.getItem('playerName') || 'Jugador';
        this.inviteLink = `${window.location.origin}/create-player/${roomId}`;
        // Obtener las iniciales del nombre del jugador
        this.playerInitials = this.getInitials(this.roomName);
        this.isSpectator = localStorage.getItem('userRole') === 'espectador'; // Cargar el estado de espectador
      }
    });
  }

  getInitials(name: string): string {
    return name.trim().substring(0, 2).toUpperCase();
  }

  inviteFriends() {
    const roomId = localStorage.getItem('roomId');
    const link = `${window.location.origin}/create-player/${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Link copiado al portapapeles');
  }

  openInviteModal() {
    this.showInviteModal = true;
  }

  closeInviteModal() {
    this.showInviteModal = false;
  }

  copyLink() {
    navigator.clipboard.writeText(this.inviteLink);
  }

  toggleMenu() {
    this.showMenu = !this.showMenu; // Mostrar/ocultar el menú desplegable
  }

  toggleSpectatorMode(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isSpectator = checked;
    const newRole = this.isSpectator ? 'espectador' : 'jugador';
    const roomId = localStorage.getItem('roomId');
    // Actualizar el rol en localStorage y emitir al servidor
    localStorage.setItem('userRole', newRole);
    
    this.socket.emit('changeRole', { playerName: this.roomName, role: newRole, roomId: roomId });
    
    // Aquí puedes agregar la lógica para notificar a otros usuarios sobre el cambio de rol
  }
  
}
