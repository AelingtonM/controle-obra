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

import { FuncionariosService } from '../services/funcionarios';


@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class HistoricoPage {

  pagamentos: any[] = [];


  constructor(
    private funcionariosService: FuncionariosService,
    private changeDetector: ChangeDetectorRef
  ) {}

  

  async ionViewWillEnter() {

    try {

      this.pagamentos =
        await this.funcionariosService
          .getHistorico();


      console.log(
        'Histórico carregado:',
        this.pagamentos
      );


      this.changeDetector.detectChanges();

    } catch (erro) {

      console.error(
        'Erro ao carregar histórico:',
        erro
      );

    }

  }


  formatarData(
    data: string
  ) {

    if (!data) {
      return '';
    }


    const [
      ano,
      mes,
      dia
    ] = data.split('-');


    return `${dia}/${mes}/${ano}`;
  }


  formatarValor(
    valor: number
  ) {

    return Number(valor)
      .toFixed(2)
      .replace('.', ',');

  }

  async apagarHistorico() {

  if (this.pagamentos.length === 0) {
    return;
  }


  const confirmar =
    window.confirm(
      'Tem certeza que deseja apagar todo o histórico?\n\n' +
      'Esta ação não poderá ser desfeita.'
    );


  if (!confirmar) {
    return;
  }


  await this.funcionariosService
    .apagarHistorico();


  this.pagamentos = [];


  this.changeDetector.detectChanges();


  window.alert(
    'Histórico apagado com sucesso.'
  );

}

}