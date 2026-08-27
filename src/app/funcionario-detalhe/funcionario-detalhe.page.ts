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

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { FuncionariosService } from '../services/funcionarios';


@Component({
  selector: 'app-funcionario-detalhe',
  templateUrl: './funcionario-detalhe.page.html',
  styleUrls: ['./funcionario-detalhe.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class FuncionarioDetalhePage {

  funcionario: any = null;

  funcionarioId = 0;

  diasTrabalhados = 0;

  novoVale: number | null = null;

  dataVale = this.getDataHoje();

  vales: {
    id?: number;
    funcionario_id?: number;
    valor: number;
    data: string;
  }[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private funcionariosService: FuncionariosService,
    private changeDetector: ChangeDetectorRef
  ) {}


  async ionViewWillEnter() {

    this.funcionarioId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    await this.carregarDados();
  }


  async carregarDados() {

    this.funcionario =
      await this.funcionariosService
        .getFuncionarioPorId(
          this.funcionarioId
        );


    if (this.funcionario) {

      this.diasTrabalhados =
        Number(
          this.funcionario.dias_trabalhados
        ) || 0;

    }


    this.vales =
      await this.funcionariosService
        .getVales(
          this.funcionarioId
        );


    this.changeDetector.detectChanges();
  }


  async fecharPagina() {

    await this.router.navigateByUrl(
      '/home'
    );

  }


  async adicionarDia() {

    this.diasTrabalhados++;


    await this.funcionariosService
      .atualizarDias(
        this.funcionarioId,
        this.diasTrabalhados
      );

  }


  async removerDia() {

    if (this.diasTrabalhados > 0) {

      this.diasTrabalhados--;


      await this.funcionariosService
        .atualizarDias(
          this.funcionarioId,
          this.diasTrabalhados
        );

    }

  }


  async adicionarVale() {

    if (
      this.novoVale === null ||
      this.novoVale <= 0 ||
      !this.dataVale
    ) {
      return;
    }


    await this.funcionariosService
      .adicionarVale(
        this.funcionarioId,
        this.novoVale,
        this.dataVale
      );


    this.novoVale = null;

    this.dataVale =
      this.getDataHoje();


    this.vales =
      await this.funcionariosService
        .getVales(
          this.funcionarioId
        );


    this.changeDetector.detectChanges();
  }


  // =====================================================
  // FINALIZAR PAGAMENTO
  // Salva a quinzena no histórico e depois limpa
  // dias e vales atuais.
  // =====================================================

  async finalizarPagamento() {

    if (
      this.diasTrabalhados === 0 &&
      this.vales.length === 0
    ) {

      window.alert(
        'Não existem dados para finalizar este pagamento.'
      );

      return;
    }


    const nome =
      this.funcionario?.nome ??
      'Funcionário';


    const valor =
      this.totalPagar
        .toFixed(2)
        .replace('.', ',');


    const confirmar =
      window.confirm(
        `Finalizar pagamento de ${nome}?\n\n` +
        `Valor a pagar: R$ ${valor}\n\n` +
        'Esta quinzena será salva no Histórico e os dias e vales serão zerados.'
      );


    if (!confirmar) {
      return;
    }


    try {

      await this.funcionariosService
        .finalizarPagamento(
          this.funcionarioId,
          this.getDataHoje()
        );


      // Atualiza a tela para começar
      // uma nova quinzena
      this.diasTrabalhados = 0;

      this.vales = [];

      this.novoVale = null;

      this.dataVale =
        this.getDataHoje();


      if (this.funcionario) {

        this.funcionario.dias_trabalhados = 0;

      }


      this.changeDetector.detectChanges();


      window.alert(
        'Pagamento finalizado e salvo no Histórico!'
      );

    } catch (erro) {

      console.error(
        'Erro ao finalizar pagamento:',
        erro
      );


      window.alert(
        'Não foi possível finalizar o pagamento.'
      );

    }

  }


  async excluirFuncionario() {

    const nome =
      this.funcionario?.nome ??
      'este funcionário';


    const confirmar =
      window.confirm(
        `Tem certeza que deseja excluir ${nome}?\n\n` +
        'O funcionário será removido do cadastro.'
      );


    if (!confirmar) {
      return;
    }


    await this.funcionariosService
      .excluirFuncionario(
        this.funcionarioId
      );


    await this.router.navigateByUrl(
      '/funcionarios'
    );

  }


  getDataHoje() {

    const hoje =
      new Date();


    const ano =
      hoje.getFullYear();


    const mes =
      String(
        hoje.getMonth() + 1
      ).padStart(2, '0');


    const dia =
      String(
        hoje.getDate()
      ).padStart(2, '0');


    return `${ano}-${mes}-${dia}`;
  }


  formatarData(
    data: string
  ) {

    const [
      ano,
      mes,
      dia
    ] = data.split('-');


    return `${dia}/${mes}/${ano}`;
  }


  get totalDiarias() {

    if (!this.funcionario) {
      return 0;
    }


    return (
      this.diasTrabalhados *
      Number(
        this.funcionario.diaria
      )
    );
  }


  get totalVales() {

    return this.vales.reduce(
      (
        total,
        vale
      ) =>
        total +
        Number(vale.valor),
      0
    );
  }


  get totalPagar() {

    return (
      this.totalDiarias -
      this.totalVales
    );
  }

}