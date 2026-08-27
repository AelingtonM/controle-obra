import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page')
        .then(m => m.HomePage),
  },

  {
    path: 'funcionarios',
    loadComponent: () =>
      import('./funcionarios/funcionarios.page')
        .then(m => m.FuncionariosPage),
  },

  {
    path: 'novo-funcionario',
    loadComponent: () =>
      import('./novo-funcionario/novo-funcionario.page')
        .then(m => m.NovoFuncionarioPage),
  },

  {
    path: 'funcionario-detalhe/:id',
    loadComponent: () =>
      import('./funcionario-detalhe/funcionario-detalhe.page')
        .then(m => m.FuncionarioDetalhePage),
  },

  {
    path: 'historico',
    loadComponent: () =>
      import('./historico/historico.page')
        .then(m => m.HistoricoPage),
  },

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  }

];