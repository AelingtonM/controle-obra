import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FuncionarioDetalhePage } from './funcionario-detalhe.page';

describe('FuncionarioDetalhePage', () => {
  let component: FuncionarioDetalhePage;
  let fixture: ComponentFixture<FuncionarioDetalhePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FuncionarioDetalhePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
