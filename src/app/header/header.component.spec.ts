import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs'; // Simula eventos de enrutador
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockRouter = {
    events: of({}), // Simula eventos del router
    url: ''
  };
  let mockActivatedRoute = {
    paramMap: of({ get: () => '1' }) // Simula obtener parámetros de la URL
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA] // Ignora componentes hijos en el HTML
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger lifecycle methods
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize values correctly when URL is not game-table', () => {
    mockRouter.url = '/some-other-page';
    fixture.detectChanges(); // Refresca el componente con la nueva URL
    expect(component.showGameTableInfo).toBeFalse();
    expect(component.isGameTablePage).toBeFalse();
  });

  it('should set game details when URL is game-table', () => {
    const roomId = '123';
    localStorage.setItem('roomId', roomId);
    localStorage.setItem('roomName', 'Test Room');
    localStorage.setItem('playerName', 'PlayerName');
    mockRouter.url = `/game-table/${roomId}`;

    fixture.detectChanges(); // Refresca el componente con la nueva URL

    expect(component.showGameTableInfo).toBeTrue();
    expect(component.gameName).toBe('Test Room');
    expect(component.playerInitials).toBe('PL');
    expect(component.inviteLink).toBe(`${window.location.origin}/create-player/${roomId}`);
  });

  it('should toggle menu visibility', () => {
    expect(component.showMenu).toBeFalse(); // Inicialmente oculto
    component.toggleMenu();
    expect(component.showMenu).toBeTrue(); // Debería estar visible después de togglear
    component.toggleMenu();
    expect(component.showMenu).toBeFalse(); // Debería volver a estar oculto
  });

  it('should copy invite link to clipboard', () => {
    spyOn(navigator.clipboard, 'writeText');
    component.inviteLink = 'https://test-link.com';
    component.copyLink();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://test-link.com');
  });

  it('should open and close invite modal', () => {
    component.openInviteModal();
    expect(component.showInviteModal).toBeTrue();

    component.closeInviteModal();
    expect(component.showInviteModal).toBeFalse();
  });

  it('should toggle spectator mode and update role in localStorage', () => {
    const event = { target: { checked: true } } as unknown as Event;
    spyOn(localStorage, 'setItem');
    spyOn(component.socket, 'emit');

    component.toggleSpectatorMode(event);

    expect(component.isSpectator).toBeTrue();
    expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'espectador');
    expect(component.socket.emit).toHaveBeenCalledWith('changeRole', jasmine.any(Object));
  });

});
