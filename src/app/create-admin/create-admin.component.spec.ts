import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CreateAdminComponent } from './create-admin.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { setUserRole } from '../store/game.actions';

describe('CreateAdminComponent', () => {
  let component: CreateAdminComponent;
  let fixture: ComponentFixture<CreateAdminComponent>;
  let store: MockStore;
  const initialState = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CreateAdminComponent],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(CreateAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Detect initial bindings
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should create the form with valid initial state', () => {
    expect(component.adminForm).toBeTruthy();
    const adminNameControl = component.adminForm.controls['adminName'];
    const modeControl = component.adminForm.controls['mode'];

    expect(adminNameControl.value).toBe(''); // Initial value is empty
    expect(adminNameControl.valid).toBeFalsy(); // Should be invalid initially
    expect(modeControl.value).toBe(''); // No mode selected initially
    expect(modeControl.valid).toBeFalsy(); // Invalid initially as it's required
  });

  it('should validate the adminName with valid input', () => {
    const adminNameControl = component.adminForm.controls['adminName'];
    adminNameControl.setValue('Admin123'); // Valid input

    expect(adminNameControl.valid).toBeTruthy();
  });

  it('should invalidate the adminName if it contains only numbers', () => {
    const adminNameControl = component.adminForm.controls['adminName'];
    adminNameControl.setValue('12345'); // Only numbers

    expect(adminNameControl.valid).toBeFalsy();
    expect(adminNameControl.errors?.['noNumbersOnly']).toBeTruthy();
  });

  it('should invalidate the form if mode is not selected', () => {
    const modeControl = component.adminForm.controls['mode'];
    expect(modeControl.valid).toBeFalsy(); // Mode is required, initially invalid
  });

  it('should dispatch setUserRole action on valid form submission', () => {
    spyOn(store, 'dispatch').and.callThrough();
    const adminNameControl = component.adminForm.controls['adminName'];
    const modeControl = component.adminForm.controls['mode'];

    adminNameControl.setValue('AdminUser');
    modeControl.setValue('jugador');

    expect(component.adminForm.valid).toBeTruthy();

    component.onSubmit();

    expect(store.dispatch).toHaveBeenCalledWith(setUserRole({ role: 'jugador' }));
  });

  it('should store adminName and userRole in localStorage on form submission', () => {
    spyOn(localStorage, 'setItem').and.callThrough();
    const adminNameControl = component.adminForm.controls['adminName'];
    const modeControl = component.adminForm.controls['mode'];

    adminNameControl.setValue('AdminUser');
    modeControl.setValue('espectador');

    component.onSubmit();

    expect(localStorage.setItem).toHaveBeenCalledWith('adminName', 'AdminUser');
    expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'espectador');
  });

});
