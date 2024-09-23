import { Component, OnInit, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';

interface Player {
  name: string;
  role: 'jugador' | 'espectador';
  roleAdmin: 'admin' | 'jugador';
  selectedCard: string | null;
}

interface RoomDetails {
  players: {
    playerName: string;
    role: 'jugador' | 'espectador';
    roleAdmin: 'admin' | 'jugador';
  }[];
  scoringMode: 'fibonacci' | 'tshirt'; // Nuevo campo para el modo de puntaje
}

interface RoleChangeData {
  playerName: string;
  role: 'jugador' | 'espectador';
}

interface AdminChangeData {
  playerName: string;
  roleAdmin: 'admin' | 'jugador';
}

interface CardSelectionData {
  playerName: string;
  card: string;
}

interface ScoringModeChangeData {
  scoringMode: 'fibonacci' | 'tshirt';
  roomId: string;
}

@Component({
  selector: 'app-game-table',
  templateUrl: './game-table.component.html',
  styleUrls: ['./game-table.component.scss']
})
export class GameTableComponent implements OnInit, OnDestroy {
  playerName: string = '';
  playerInitials: string = '';
  userRole: 'jugador' | 'espectador' = 'jugador';
  isSpectator: boolean = false;
  cards: string[] = [];
  selectedCard: string | null = null;
  socket!: Socket;
  roomId: string = '';
  playersTop: Player[] = [];
  playersLeft: Player[] = [];
  playersRight: Player[] = [];
  playersBottom: Player[] = [];
  allPlayers: Player[] = [];
  cardsRevealed: boolean = false;
  isVotingActive: boolean = true;
  groupedSelectedCards: { cardValue: string; voteCount: number }[] = [];
  average: number | null = null;
  selectedPlayer: Player | undefined = undefined;
  isAdminChecked: boolean = false;
  showAdminModal: boolean = false;
  scoringModes: { label: string; value: 'fibonacci' | 'tshirt'; cards: string[] }[] = [];
  selectedScoringMode: 'fibonacci' | 'tshirt' = 'fibonacci'; // Por defecto Fibonacci

  constructor() {
    this.playerName =
      localStorage.getItem('adminName') ||
      localStorage.getItem('playerName') ||
      'Jugador';
    this.playerInitials = this.getInitials(this.playerName);
    this.userRole =
      (localStorage.getItem('userRole') as 'jugador' | 'espectador') ||
      'jugador';
    this.isSpectator = this.userRole === 'espectador';
    this.roomId = localStorage.getItem('roomId') || '';

    this.socket = io('http://localhost:3000');

    // Definición de los modos de puntaje
    this.scoringModes = [
      {
        label: 'Fibonacci',
        value: 'fibonacci',
        cards: ['0', '1', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕']
      },
      {
        label: 'T-Shirt',
        value: 'tshirt',
        cards: ['XS', 'S', 'M', 'L', 'XL', '?', '☕']
      }
    ];
  }

  ngOnInit() {
    // Establecer el modo de puntaje por defecto
    this.selectedScoringMode = this.scoringModes[0].value;
    this.cards = this.scoringModes[0].cards;

    this.socket.emit('joinRoom', {
      playerName: this.playerName,
      role: this.userRole,
      roomId: this.roomId
    });

    this.socket.on('roomDetails', (data: RoomDetails) => {
      console.log('Detalles de la sala recibidos:', data);
      this.allPlayers = data.players.map(player => ({
        name: player.playerName,
        role: player.role,
        roleAdmin: player.roleAdmin,
        selectedCard: null
      }));
      // Actualizar el modo de puntaje si está disponible
      if (data.scoringMode) {
        this.selectedScoringMode = data.scoringMode;
        this.updateCardsBasedOnScoringMode();
      }
      this.distributePlayers();
    });

    this.socket.on('roleChanged', (data: RoleChangeData) => {
      const player = this.allPlayers.find(p => p.name === data.playerName);
      if (player) {
        player.role = data.role;
        if (player.name === this.playerName) {
          this.isSpectator = data.role === 'espectador';
        }
        this.distributePlayers();
      }
    });

    this.socket.on('changeAdmin', (data: AdminChangeData) => {
      console.log(data);
      const player = this.allPlayers.find(p => p.name === data.playerName);
      if (player) {
        player.roleAdmin = data.roleAdmin;
        if (player.name === this.playerName) {
          this.updateLocalStorageRole(player.roleAdmin);
        }
        this.distributePlayers();
      }
    });

    this.socket.on('cardSelected', (data: CardSelectionData) => {
      const player = this.allPlayers.find(p => p.name === data.playerName);
      if (player) {
        player.selectedCard = data.card;
        console.log(`${data.playerName} seleccionó la carta ${data.card}`);
      }
    });

    this.socket.on('cardsRevealed', () => {
      this.cardsRevealed = true;
      this.calculateGroupedVotesAndAverage();
    });

    this.socket.on('restartVoting', () => {
      this.resetVotingState();
    });

    this.socket.on('scoringModeChanged', (data: ScoringModeChangeData) => {
      this.selectedScoringMode = data.scoringMode;
      this.updateCardsBasedOnScoringMode();
      this.resetVotingState();
    });
  }

  ngOnDestroy() {
    this.socket.off('roomDetails');
    this.socket.off('roleChanged');
    this.socket.off('changeAdmin');
    this.socket.off('cardSelected');
    this.socket.off('cardsRevealed');
    this.socket.off('restartVoting');
    this.socket.off('scoringModeChanged');
  }

  updateLocalStorageRole(roleAdmin: 'admin' | 'jugador') {
    if (roleAdmin === 'admin') {
      localStorage.setItem('adminName', this.playerName);
      localStorage.removeItem('playerName');
    } else {
      localStorage.setItem('playerName', this.playerName);
      localStorage.removeItem('adminName');
      localStorage.setItem('userRole', this.userRole);
    }
  }

  openAdminModal(player: Player) {
    if (this.isAdminUser()) {
      this.selectedPlayer = player;
      this.isAdminChecked = player.roleAdmin === 'admin';
      this.showAdminModal = true;
    }
  }

  closeAdminModal() {
    this.selectedPlayer = undefined;
    this.showAdminModal = false;
  }

  toggleAdminRole(player?: Player) {
    const targetPlayer = player || this.selectedPlayer;
    if (targetPlayer) {
      targetPlayer.roleAdmin = this.isAdminChecked ? 'admin' : 'jugador';
      this.socket.emit('changeAdmin', {
        playerName: targetPlayer.name,
        roleAdmin: targetPlayer.roleAdmin,
        roomId: this.roomId
      });
    }
    this.closeAdminModal();
  }

  distributePlayers() {
    const totalPlayers = this.allPlayers.length;
    const topPlayersCount = Math.min(Math.floor(totalPlayers / 2), 3);
    const bottomPlayersCount = Math.min(
      totalPlayers - topPlayersCount,
      2
    );
    const leftPlayersCount = Math.min(
      Math.floor((totalPlayers - topPlayersCount - bottomPlayersCount) / 2),
      1
    );
    const rightPlayersCount =
      totalPlayers - topPlayersCount - bottomPlayersCount - leftPlayersCount;

    this.playersTop = this.allPlayers.slice(0, topPlayersCount);
    this.playersBottom = this.allPlayers.slice(
      topPlayersCount,
      topPlayersCount + bottomPlayersCount
    );
    this.playersLeft = this.allPlayers.slice(
      topPlayersCount + bottomPlayersCount,
      topPlayersCount + bottomPlayersCount + leftPlayersCount
    );
    this.playersRight = this.allPlayers.slice(
      topPlayersCount + bottomPlayersCount + leftPlayersCount
    );
  }

  getInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  selectCard(card: string) {
    if (!this.isVotingActive || this.isSpectator) {
      return;
    }
    this.selectedCard = card;
    localStorage.setItem('selectedCard', card);
    this.socket.emit('selectCard', {
      playerName: this.playerName,
      card,
      roomId: this.roomId
    });
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
    if (this.isAdminUser()) {
      this.socket.emit('revealCards', this.roomId);
    }
  }

  restartVoting() {
    if (this.isAdminUser()) {
      this.resetVotingState();
      this.socket.emit('restartVoting', this.roomId);
    }
  }

  resetVotingState() {
    this.selectedCard = null;
    this.allPlayers.forEach(player => (player.selectedCard = null));
    this.cardsRevealed = false;
    this.isVotingActive = true;
    this.groupedSelectedCards = [];
    this.average = null;
  }

  calculateGroupedVotesAndAverage() {
    const allSelectedCards = this.allPlayers
      .filter(player => player.selectedCard)
      .map(player => player.selectedCard!);

    // Agrupar las cartas por valor y contar los votos
    this.groupedSelectedCards = allSelectedCards.reduce((acc, card) => {
      const existing = acc.find(item => item.cardValue === card);
      if (existing) {
        existing.voteCount++;
      } else {
        acc.push({ cardValue: card, voteCount: 1 });
      }
      return acc;
    }, [] as { cardValue: string; voteCount: number }[]);

    // Solo calcular el promedio si el modo de puntaje es 'fibonacci'
    if (this.selectedScoringMode === 'fibonacci') {
      const validCards = this.allPlayers
        .filter(
          player =>
            player.selectedCard &&
            !['?', '☕'].includes(player.selectedCard!)
        )
        .map(player => parseFloat(player.selectedCard!))
        .filter(value => !isNaN(value));

      const sum = validCards.reduce((total, num) => total + num, 0);
      this.average =
        validCards.length > 0 ? sum / validCards.length : null;
    } else {
      this.average = null;
    }
  }

  // Nuevo método para actualizar las cartas según el modo de puntaje
  updateCardsBasedOnScoringMode() {
    const mode = this.scoringModes.find(
      m => m.value === this.selectedScoringMode
    );
    if (mode) {
      this.cards = mode.cards;
    }
  }

  // Método para cambiar el modo de puntaje
  changeScoringMode() {
    if (!this.isAdminUser()) {
      return;
    }

    if (this.cardsRevealed) {
      alert(
        'No se puede cambiar el modo de puntaje después de revelar las cartas. Reinicia la votación primero.'
      );
      return;
    }

    // Emitir el cambio de modo al servidor
    this.socket.emit('changeScoringMode', {
      scoringMode: this.selectedScoringMode,
      roomId: this.roomId
    });
  }
}
