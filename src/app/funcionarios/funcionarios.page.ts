import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import { RouterLink } from '@angular/router';

import { FuncionariosService } from '../services/funcionarios';

@Component({
  selector: 'app-funcionarios',
  templateUrl: './funcionarios.page.html',
  styleUrls: ['./funcionarios.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class FuncionariosPage {

  funcionarios: {
    id: number;
    nome: string;
    funcao: string;
    diaria: number;
    dias_trabalhados: number;
  }[] = [];

  constructor(
    private funcionariosService: FuncionariosService,
    private changeDetector: ChangeDetectorRef
  ) {}


  
  async ionViewWillEnter() {

    try {

      this.funcionarios =
        await this.funcionariosService.getFuncionarios();

      console.log(
        'Funcionários carregados:',
        this.funcionarios
      );

      // Força a tela a atualizar depois
      // que o SQLite devolver os dados
      this.changeDetector.detectChanges();

    } catch (erro) {

      console.error(
        'Erro ao carregar funcionários:',
        erro
      );

    }

  }

}