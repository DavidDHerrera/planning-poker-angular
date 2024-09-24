import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { JoinRoomComponent } from './join-room.component';
import { setUserRole } from '../store/game.actions';  // Acción mock para pruebas

describe('JoinRoomComponent', () => {
  let component: JoinRoomComponent;
  let fixture: ComponentFixture<JoinRoomComponent>;
  let mockStore: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockSocket: any;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      paramMap: of({ get: (key: string) => '123' })  // Simulación de un roomId extraído de la URL
    };

    mockSocket = {
      emit: jasmine.createSpy('emit'),
      on: jasmine.createSpy('on')
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, JoinRoomComponent],  // Importar JoinRoomComponent aquí
      providers: [
        FormBuilder,
        { provide: Store, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JoinRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should validate playerName correctly for required field', () => {
    const playerNameControl = component.playerForm.get('playerName')!;
    playerNameControl.setValue('');
    expect(playerNameControl.hasError('required')).toBeTrue();
  });

  it('should validate playerName for max 3 numbers', () => {
    const playerNameControl = component.playerForm.get('playerName')!;
    playerNameControl.setValue('Player123');
    expect(playerNameControl.hasError('maxNumbers')).toBeNull();

    playerNameControl.setValue('Player1234');
    expect(playerNameControl.hasError('maxNumbers')).toBeTrue();
  });

  it('should invalidate playerName if it consists only of numbers', () => {
    const playerNameControl = component.playerForm.get('playerName')!;
    playerNameControl.setValue('12345');
    expect(playerNameControl.hasError('noNumbersOnly')).toBeTrue();
  });

  it('should submit the form if valid and emit joinRoom event', fakeAsync(() => {
    const playerNameControl = component.playerForm.get('playerName')!;
    const modeControl = component.playerForm.get('mode')!;
    spyOn(component.socket, 'emit'); // Simular el socket emit

    playerNameControl.setValue('PlayerOne');
    modeControl.setValue('jugador');
    component.roomId = 'testRoomId';

    component.onSubmit();
    tick();  // Simular el tiempo necesario para la ejecución

    expect(component.socket.emit).toHaveBeenCalledWith('joinRoom', {
      playerName: 'PlayerOne',
      role: 'jugador',
      roomId: 'testRoomId'
    });

    expect(mockStore.dispatch).toHaveBeenCalledWith(setUserRole({ role: 'jugador' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/game-table/testRoomId']);
  }));

  it('should not submit the form if roomId is missing', () => {
    const playerNameControl = component.playerForm.get('playerName')!;
    playerNameControl.setValue('PlayerOne');
    component.roomId = null; // Simular roomId faltante

    component.onSubmit();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.socket.emit).not.toHaveBeenCalled();
  });
});
