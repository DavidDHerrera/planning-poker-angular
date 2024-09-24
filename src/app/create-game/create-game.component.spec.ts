import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateGameComponent } from './create-game.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import * as io from 'socket.io-client'; // Importa correctamente el módulo de Socket.IO

describe('CreateGameComponent', () => {
  let component: CreateGameComponent;
  let fixture: ComponentFixture<CreateGameComponent>;
  let mockRouter: any;
  let mockStore: any;
  let mockSocket: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockStore = jasmine.createSpyObj('Store', ['dispatch']);

    // Mock de Socket.IO
    mockSocket = {
      emit: jasmine.createSpy('emit'),
      on: jasmine.createSpy('on').and.callFake((event: string, callback: Function) => {
        if (event === 'createRoom') {
          callback({ roomId: 'testRoomId', roomName: 'testRoomName' });
        }
      }),
    };

    // Mockeo de la función io() para devolver mockSocket
    spyOn(io, 'default').and.returnValue(mockSocket);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CreateGameComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit data when the room is created', async () => {
    component.gameForm.controls['name'].setValue('Test Room');
    component.onSubmit();

    expect(mockSocket.emit).toHaveBeenCalledWith('createRoom', {
      roomId: jasmine.any(String),
      roomName: 'Test Room',
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/create-admin']);
  });
});
