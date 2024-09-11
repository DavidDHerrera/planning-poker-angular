import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CreateGameComponent } from './create-game.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { setGameName } from '../store/game.actions';
import { AppState } from '../store/app.state';

describe('CreateGameComponent', () => {
  let component: CreateGameComponent;
  let fixture: ComponentFixture<CreateGameComponent>;
  let store: MockStore<AppState>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CreateGameComponent],
      providers: [
        provideMockStore(),
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(CreateGameComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should create the form with initial empty value', () => {
    expect(component.gameForm).toBeTruthy();
    const nameControl = component.gameForm.controls['name'];

    expect(nameControl.value).toBe(''); // Initial value is empty
    expect(nameControl.valid).toBeFalsy(); // Should be invalid initially
  });

  it('should validate the name when input is valid', () => {
    const nameControl = component.gameForm.controls['name'];
    nameControl.setValue('Nombre123'); // Valid input

    expect(nameControl.valid).toBeTruthy();
  });

  it('should invalidate the name if it has too many numbers', () => {
    const nameControl = component.gameForm.controls['name'];
    nameControl.setValue('Nombre1234'); // Too many numbers

    expect(nameControl.valid).toBeFalsy();
    expect(nameControl.errors?.['maxNumbers']).toBeTruthy();
  });

  it('should invalidate the name if it only contains numbers', () => {
    const nameControl = component.gameForm.controls['name'];
    nameControl.setValue('12345'); // Only numbers

    expect(nameControl.valid).toBeFalsy();
    expect(nameControl.errors?.['noNumbersOnly']).toBeTruthy();
  });

  it('should store player name in localStorage on form submission', () => {
    spyOn(localStorage, 'setItem').and.callThrough();
    const nameControl = component.gameForm.controls['name'];
    nameControl.setValue('NombreValido');

    component.onSubmit();

    expect(localStorage.setItem).toHaveBeenCalledWith('playerName', 'NombreValido');
  });

  it('should dispatch setGameName action on form submission', () => {
    spyOn(store, 'dispatch').and.callThrough();
    const nameControl = component.gameForm.controls['name'];
    nameControl.setValue('NombreValido');

    component.onSubmit();

    expect(store.dispatch).toHaveBeenCalledWith(setGameName({ gameName: 'NombreValido' }));
  });

  it('should navigate to /create-admin on valid form submission', () => {
    const nameControl = component.gameForm.controls['name'];
    nameControl.setValue('NombreValido');

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/create-admin']);
  });

  it('should not submit if form is invalid', () => {
    spyOn(store, 'dispatch');  // Mantén el espionaje sobre el store

    component.onSubmit();

    expect(store.dispatch).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();  // Verifica que no navegue si es inválido
  });
});
