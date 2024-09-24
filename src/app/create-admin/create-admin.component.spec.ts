import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { CreateAdminComponent } from './create-admin.component';
import { AppState } from '../store/app.state';  // Mock AppState for testing
import { setUserRole } from '../store/game.actions';  // Mock action for testing
import { of } from 'rxjs';

describe('CreateAdminComponent', () => {
  let component: CreateAdminComponent;
  let fixture: ComponentFixture<CreateAdminComponent>;
  let mockStore: any;
  let mockRouter: any;

  beforeEach(() => {
    mockStore = jasmine.createSpyObj('Store', ['dispatch']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CreateAdminComponent],  // Mueve CreateAdminComponent aquí
      providers: [
        FormBuilder,
        { provide: Store, useValue: mockStore },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should validate adminName correctly for required field', () => {
    const adminNameControl = component.adminForm.get('adminName')!;
    adminNameControl.setValue('');
    expect(adminNameControl.hasError('required')).toBeTrue();
  });
  
  it('should validate adminName for max 3 numbers', () => {
    const adminNameControl = component.adminForm.get('adminName')!;
    adminNameControl.setValue('Admin123');
    expect(adminNameControl.hasError('maxNumbers')).toBeFalse();
  
    adminNameControl.setValue('Admin1234');
    expect(adminNameControl.hasError('maxNumbers')).toBeTrue();
  });
  
  it('should invalidate adminName if it consists only of numbers', () => {
    const adminNameControl = component.adminForm.get('adminName')!;
    adminNameControl.setValue('12345');
    expect(adminNameControl.hasError('noNumbersOnly')).toBeTrue();
  });
  
  it('should submit the form if it is valid', () => {
    const adminNameControl = component.adminForm.get('adminName')!;
    const modeControl = component.adminForm.get('mode')!;
  
    adminNameControl.setValue('AdminUser');
    modeControl.setValue('admin');
  
    component.onSubmit();
  
    expect(mockStore.dispatch).toHaveBeenCalledWith(setUserRole({ role: 'admin' }));
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
});
