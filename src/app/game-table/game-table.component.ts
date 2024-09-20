import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';

interface Player {
  name: string;
  role: string;
  selectedCard: string | null;
}

@Component({
  selector: 'app-game-table',
  templateUrl: './game-table.component.html',
  styleUrls: ['./game-table.component.scss']
})
export class GameTableComponent implements OnInit {
  playerName: string = '';
  playerInitials: string = '';
  userRole: string = '';
  isSpectator: boolean = false;
  cards: string[] = ['0', '1', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];
  selectedCard: string | null = null;
  socket: any;
  roomId: string = '';
  playersTop: Player[] = [];
  playersLeft: Player[] = [];
  playersRight: Player[] = [];
  playersBottom: Player[] = [];
  allPlayers: Player[] = []; // Lista dinámica de jugadores conectados
  cardsRevealed: boolean = false; // Indica si las cartas están reveladas
  isVotingActive: boolean = true; // Controla si la votación está activa
  revealedCardsSummary: { card: string; count: number }[] = []; // Resumen de cartas y conteo de votos
  averageVote: number | null = null; // Promedio de los votos

  constructor() {
    this.playerName = localStorage.getItem('adminName') || localStorage.getItem('playerName') || 'Jugador';
    this.playerInitials = this.getInitials(this.playerName);
    this.userRole = localStorage.getItem('userRole') || 'jugador';
    this.isSpectator = this.userRole === 'espectador';
    this.roomId = localStorage.getItem('roomId') || '';

    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.socket.emit('joinRoom', { playerName: this.playerName, role: this.userRole, roomId: this.roomId });

    this.socket.on('roomDetails', (data: any) => {
      console.log('Detalles de la sala recibidos:', data);
      this.allPlayers = data.players.map((player: any) => ({
        name: player.playerName,
        role: player.role,
        selectedCard: null,
      }));
      this.distributePlayers();
    });

    this.socket.on('roleChanged', (data: any) => {
      const player = this.allPlayers.find(p => p.name === data.playerName);
      if (player) {
        player.role = data.role;
        
        // Si el jugador actual cambia su rol
        if (player.name === this.playerName) {
          this.isSpectator = data.role === 'espectador';
        }
    
        this.distributePlayers();
      }
    });
    

    this.socket.on('cardSelected', (data: any) => {
      console.log(data);
      const player = this.allPlayers.find(p => p.name === data.playerName);
      if (player) {
        player.selectedCard = data.card;
        console.log(`${data.playerName} seleccionó la carta ${data.card}`);
      }
    });

    this.socket.on('cardsRevealed', (data: any) => {
      this.cardsRevealed = true;
      this.calculateGroupedVotesAndAverage();
    });

    this.socket.on('restartVoting', () => {
      this.selectedCard = null;
      this.allPlayers.forEach(player => player.selectedCard = null);
      this.cardsRevealed = false;
      this.isVotingActive = true;
      this.revealedCardsSummary = [];
      this.averageVote = null;
    });
  }

  distributePlayers() {
    const totalPlayers = this.allPlayers.length;
    const topPlayersCount = Math.min(Math.floor(totalPlayers / 2), 3);
    const bottomPlayersCount = Math.min(totalPlayers - topPlayersCount, 2);
    const leftPlayersCount = Math.min(Math.floor((totalPlayers - topPlayersCount - bottomPlayersCount) / 2), 1);
    const rightPlayersCount = totalPlayers - topPlayersCount - bottomPlayersCount - leftPlayersCount;

    this.playersTop = this.allPlayers.slice(0, topPlayersCount);
    this.playersBottom = this.allPlayers.slice(topPlayersCount, topPlayersCount + bottomPlayersCount);
    this.playersLeft = this.allPlayers.slice(topPlayersCount + bottomPlayersCount, topPlayersCount + bottomPlayersCount + leftPlayersCount);
    this.playersRight = this.allPlayers.slice(topPlayersCount + bottomPlayersCount + leftPlayersCount);
  }

  getInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  selectCard(card: string) {
    this.selectedCard = card;
    localStorage.setItem('selectedCard', card);
    this.socket.emit('selectCard', { playerName: this.playerName, card, roomId: this.roomId });
    console.log(`Carta seleccionada: ${card} en la sala ${this.roomId}`);
    const player = this.allPlayers.find(p => p.name === this.playerName);
    if (player) {
      player.selectedCard = card;
    }
  }

  isSelected(card: string): boolean {
    return this.selectedCard === card;
  }

  isAdminUser(): boolean {
    return !!localStorage.getItem('adminName');
  }

  revealCards() {
    this.socket.emit('revealCards', this.roomId);
    this.cardsRevealed = true;
    this.isVotingActive = false;
  }

  restartVoting() {
    // Solo el administrador debe emitir este evento
    if (this.isAdminUser()) {
      this.selectedCard = null;
      this.allPlayers.forEach(player => player.selectedCard = null);
      this.cardsRevealed = false;
      this.isVotingActive = true;
      this.revealedCardsSummary = [];
      this.averageVote = null;

      // Emitir el evento de reinicio al servidor solo si es el administrador
      this.socket.emit('restartVoting', this.roomId);
    }
  }




  groupedSelectedCards: { cardValue: string, voteCount: number }[] = [];
  average: number = 0;

  calculateGroupedVotesAndAverage() {
    const validCards = this.allPlayers
      .filter(player => player.selectedCard && !['?', '☕'].includes(player.selectedCard)) // Filtrar jugadores con cartas válidas para el promedio
      .map(player => parseInt(player.selectedCard!)); // Convertir las cartas seleccionadas a enteros

    const allSelectedCards = this.allPlayers
      .filter(player => player.selectedCard) // Incluir todas las cartas seleccionadas, incluso '?', '☕'
      .map(player => player.selectedCard);

    // Agrupar las cartas por valor y contar los votos
    this.groupedSelectedCards = allSelectedCards.reduce((acc: any, card) => {
      const foundCard = acc.find((item: any) => item.cardValue === card);
      if (foundCard) {
        foundCard.voteCount++;
      } else {
        acc.push({ cardValue: card, voteCount: 1 });
      }
      return acc;
    }, []);

    // Calcular el promedio solo con las cartas válidas
    const sum = validCards.reduce((total, card) => total + card, 0);
    this.average = validCards.length > 0 ? sum / validCards.length : 0;
  }
}
