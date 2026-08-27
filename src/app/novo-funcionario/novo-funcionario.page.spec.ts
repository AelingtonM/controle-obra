import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoFuncionarioPage } from './novo-funcionario.page';

describe('NovoFuncionarioPage', () => {
  let component: NovoFuncionarioPage;
  let fixture: ComponentFixture<NovoFuncionarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NovoFuncionarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
