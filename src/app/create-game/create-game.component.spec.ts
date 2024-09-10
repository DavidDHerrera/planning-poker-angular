import { TestBed } from '@angular/core/testing';
import { CreateGameComponent } from './create-game.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('CreateGameComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGameComponent, ReactiveFormsModule],
    }).compileComponents();
  });

  it('should create the form', () => {
    const fixture = TestBed.createComponent(CreateGameComponent);
    const component = fixture.componentInstance;
    expect(component.gameForm).toBeTruthy();
  });

  it('should invalidate the form if name is too short', () => {
    const fixture = TestBed.createComponent(CreateGameComponent);
    const component = fixture.componentInstance;
    const name = component.gameForm.controls['name'];
    name.setValue('abcd'); // Menos de 5 caracteres
    expect(name.valid).toBeFalsy();
    expect(name.errors?.['minlength']).toBeTruthy();
  });

  it('should invalidate the form if name is too long', () => {
    const fixture = TestBed.createComponent(CreateGameComponent);
    const component = fixture.componentInstance;
    const name = component.gameForm.controls['name'];
    name.setValue('abcdefghijklmnopqrstuvwxyz'); // Más de 20 caracteres
    expect(name.valid).toBeFalsy();
    expect(name.errors?.['maxlength']).toBeTruthy();
  });

  it('should invalidate the form if name contains special characters', () => {
    const fixture = TestBed.createComponent(CreateGameComponent);
    const component = fixture.componentInstance;
    const name = component.gameForm.controls['name'];
    name.setValue('name!@#'); // Contiene caracteres especiales
    expect(name.valid).toBeFalsy();
    expect(name.errors?.['pattern']).toBeTruthy();
  });

  it('should invalidate the form if name has more than 3 numbers', () => {
    const fixture = TestBed.createComponent(CreateGameComponent);
    const component = fixture.componentInstance;
    const name = component.gameForm.controls['name'];
    name.setValue('name1234'); // Más de 3 números
    expect(name.valid).toBeFalsy();
    expect(name.errors?.['maxNumbers']).toBeTruthy();
  });

  it('should invalidate the form if name contains only numbers', () => {
    const fixture = TestBed.createComponent(CreateGameComponent);
    const component = fixture.componentInstance;
    const name = component.gameForm.controls['name'];
    name.setValue('12345'); // Solo números
    expect(name.valid).toBeFalsy();
    expect(name.errors?.['noNumbersOnly']).toBeTruthy();
  });

  it('should validate a proper name', () => {
    const fixture = TestBed.createComponent(CreateGameComponent);
    const component = fixture.componentInstance;
    const name = component.gameForm.controls['name'];
    name.setValue('nombre123');
    expect(name.valid).toBeTruthy();
  });

  it('should submit the form if valid', () => {
    const fixture = TestBed.createComponent(CreateGameComponent);
    const component = fixture.componentInstance;
    const name = component.gameForm.controls['name'];
    name.setValue('nombre123');
    
    spyOn(console, 'log');  // Espía la función console.log para comprobar si se llama correctamente

    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Partida creada:', { name: 'nombre123' });
  });
});
