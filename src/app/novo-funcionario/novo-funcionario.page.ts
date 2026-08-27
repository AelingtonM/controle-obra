import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import { Router } from '@angular/router';

import { FuncionariosService } from '../services/funcionarios';

@Component({
  selector: 'app-novo-funcionario',
  templateUrl: './novo-funcionario.page.html',
  styleUrls: ['./novo-funcionario.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class NovoFuncionarioPage {

  nome = '';
  funcao = '';
  diaria: number | null = null;

  constructor(
    private funcionariosService: FuncionariosService,
    private router: Router
  ) {}

  async salvarFuncionario() {

    if (
      this.nome.trim() === '' ||
      this.funcao.trim() === '' ||
      this.diaria === null ||
      this.diaria <= 0
    ) {

      console.log(
        'Preencha todos os campos corretamente.'
      );

      return;
    }

    await this.funcionariosService.adicionarFuncionario(
      this.nome.trim(),
      this.funcao.trim(),
      this.diaria
    );

    await this.router.navigateByUrl(
      '/funcionarios'
    );
  }

}