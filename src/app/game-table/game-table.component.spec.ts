import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameTableComponent } from './game-table.component';
import { io } from 'socket.io-client';
import { of } from 'rxjs';

describe('GameTableComponent', () => {
  let component: GameTableComponent;
  let fixture: ComponentFixture<GameTableComponent>;
  let mockSocket: any;

  beforeEach(async () => {
    // Crear un mock del socket
    mockSocket = {
      emit: jasmine.createSpy('emit'),
      on: jasmine.createSpy('on').and.callFake((event: string, callback: Function) => {
        if (event === 'roomDetails') {
          callback({
            players: [
              { playerName: 'Player1', role: 'jugador', roleAdmin: 'admin' },
              { playerName: 'Player2', role: 'espectador', roleAdmin: 'jugador' }
            ],
            scoringMode: 'fibonacci'
          });
        }
      }),
      off: jasmine.createSpy('off')
    };

    // Espía la función io para que devuelva el mockSocket en lugar de una conexión real
    spyOn<any>(global, 'io').and.returnValue(mockSocket);

    await TestBed.configureTestingModule({
      declarations: [GameTableComponent],
      // Proveer cualquier dependencia necesaria aquí
    }).compileComponents();

    fixture = TestBed.createComponent(GameTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the component and receive room details', () => {
    expect(component.allPlayers.length).toBe(2);
    expect(component.allPlayers[0].name).toBe('Player1');
    expect(component.selectedScoringMode).toBe('fibonacci');
  });

  it('should emit selectCard event', () => {
    component.selectCard('5');
    expect(mockSocket.emit).toHaveBeenCalledWith('selectCard', {
      playerName: component.playerName,
      card: '5',
      roomId: component.roomId
    });
  });

  it('should emit changeScoringMode event if admin', () => {
    localStorage.setItem('adminName', 'TestAdmin');  // Simula que el usuario es administrador
    component.changeScoringMode();
    expect(mockSocket.emit).toHaveBeenCalledWith('changeScoringMode', {
      scoringMode: component.selectedScoringMode,
      roomId: component.roomId
    });
  });

  it('should not emit changeScoringMode event if not admin', () => {
    localStorage.removeItem('adminName');  // Simula que el usuario no es administrador
    component.changeScoringMode();
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('should distribute players correctly for desktop', () => {
    component.isMobile = false;
    component.allPlayers = [
      { name: 'Player1', role: 'jugador', roleAdmin: 'admin', selectedCard: null },
      { name: 'Player2', role: 'jugador', roleAdmin: 'jugador', selectedCard: null },
      { name: 'Player3', role: 'espectador', roleAdmin: 'jugador', selectedCard: null }
    ];

    component.distributePlayers();
    expect(component.playersTop.length).toBe(2);  // La mitad superior debe tener 2 jugadores
    expect(component.playersBottom.length).toBe(1);  // La parte inferior debe tener 1 jugador
  });

  it('should handle changeAdmin role and update localStorage', () => {
    const playerData = {
      playerName: 'Player1',
      roleAdmin: 'admin'
    };

    component.socket.emit('changeAdmin', playerData);
    expect(localStorage.getItem('adminName')).toBe('Player1');
  });

  it('should calculate grouped votes and average correctly', () => {
    component.allPlayers = [
      { name: 'Player1', role: 'jugador', roleAdmin: 'admin', selectedCard: '5' },
      { name: 'Player2', role: 'jugador', roleAdmin: 'jugador', selectedCard: '5' },
      { name: 'Player3', role: 'espectador', roleAdmin: 'jugador', selectedCard: null }
    ];

    component.calculateGroupedVotesAndAverage();
    expect(component.groupedSelectedCards.length).toBe(1);  // Solo una carta seleccionada '5'
    expect(component.groupedSelectedCards[0].voteCount).toBe(2);  // 2 jugadores seleccionaron '5'
    expect(component.average).toBe(5);  // Promedio es 5
  });

  afterEach(() => {
    localStorage.removeItem('adminName');
    localStorage.removeItem('playerName');
    localStorage.removeItem('roomId');
  });
});
