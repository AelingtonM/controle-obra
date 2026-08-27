import { Injectable } from '@angular/core';

import { DatabaseService } from './database';


@Injectable({
  providedIn: 'root'
})
export class FuncionariosService {

  constructor(
    private databaseService: DatabaseService
  ) {}


  // =====================================================
  // FUNCIONÁRIOS
  // =====================================================

  async getFuncionarios() {

    const db =
      await this.databaseService.getBanco();

    const resultado = await db.query(`
      SELECT
        id,
        nome,
        funcao,
        diaria,
        dias_trabalhados
      FROM funcionarios
      ORDER BY nome
    `);

    return resultado.values ?? [];
  }


  async getFuncionarioPorId(
    id: number
  ) {

    const db =
      await this.databaseService.getBanco();

    const resultado = await db.query(
      `
        SELECT
          id,
          nome,
          funcao,
          diaria,
          dias_trabalhados
        FROM funcionarios
        WHERE id = ?
      `,
      [id]
    );


    if (
      resultado.values &&
      resultado.values.length > 0
    ) {

      return resultado.values[0];

    }


    return null;
  }


  async adicionarFuncionario(
    nome: string,
    funcao: string,
    diaria: number
  ) {

    const db =
      await this.databaseService.getBanco();

    await db.run(
      `
        INSERT INTO funcionarios
        (
          nome,
          funcao,
          diaria
        )
        VALUES (?, ?, ?)
      `,
      [
        nome,
        funcao,
        diaria
      ]
    );


    await this.databaseService.salvarWeb();
  }


  async atualizarDias(
    funcionarioId: number,
    dias: number
  ) {

    const db =
      await this.databaseService.getBanco();

    await db.run(
      `
        UPDATE funcionarios
        SET dias_trabalhados = ?
        WHERE id = ?
      `,
      [
        dias,
        funcionarioId
      ]
    );


    await this.databaseService.salvarWeb();
  }


  // =====================================================
  // VALES ATUAIS
  // =====================================================

  async getVales(
    funcionarioId: number
  ) {

    const db =
      await this.databaseService.getBanco();

    const resultado = await db.query(
      `
        SELECT
          id,
          funcionario_id,
          valor,
          data
        FROM vales
        WHERE funcionario_id = ?
        ORDER BY data
      `,
      [funcionarioId]
    );


    return resultado.values ?? [];
  }


  async adicionarVale(
    funcionarioId: number,
    valor: number,
    data: string
  ) {

    const db =
      await this.databaseService.getBanco();

    await db.run(
      `
        INSERT INTO vales
        (
          funcionario_id,
          valor,
          data
        )
        VALUES (?, ?, ?)
      `,
      [
        funcionarioId,
        valor,
        data
      ]
    );


    await this.databaseService.salvarWeb();
  }


  // =====================================================
  // FINALIZAR PAGAMENTO / QUINZENA
  // =====================================================

  async finalizarPagamento(
    funcionarioId: number,
    dataPagamento: string
  ) {

    const db =
      await this.databaseService.getBanco();


    // Busca os dados atuais do funcionário
    const resultadoFuncionario =
      await db.query(
        `
          SELECT
            id,
            nome,
            funcao,
            diaria,
            dias_trabalhados
          FROM funcionarios
          WHERE id = ?
        `,
        [funcionarioId]
      );


    if (
      !resultadoFuncionario.values ||
      resultadoFuncionario.values.length === 0
    ) {

      throw new Error(
        'Funcionário não encontrado.'
      );

    }


    const funcionario =
      resultadoFuncionario.values[0];


    // Busca todos os vales da quinzena atual
    const resultadoVales =
      await db.query(
        `
          SELECT
            id,
            valor,
            data
          FROM vales
          WHERE funcionario_id = ?
          ORDER BY data
        `,
        [funcionarioId]
      );


    const vales =
      resultadoVales.values ?? [];


    const diaria =
      Number(funcionario.diaria);


    const diasTrabalhados =
      Number(
        funcionario.dias_trabalhados
      ) || 0;


    const totalDiarias =
      diasTrabalhados * diaria;


    const totalVales =
      vales.reduce(
        (
          total: number,
          vale: any
        ) => {

          return (
            total +
            Number(vale.valor)
          );

        },
        0
      );


    const totalPago =
      totalDiarias - totalVales;


    // -------------------------------------------------
    // 1. Salva o pagamento no histórico
    // -------------------------------------------------

    await db.run(
      `
        INSERT INTO pagamentos
        (
          funcionario_id,
          nome,
          funcao,
          diaria,
          dias_trabalhados,
          total_diarias,
          total_vales,
          total_pago,
          data_pagamento
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        funcionarioId,
        funcionario.nome,
        funcionario.funcao,
        diaria,
        diasTrabalhados,
        totalDiarias,
        totalVales,
        totalPago,
        dataPagamento
      ]
    );


    // Descobre o ID do pagamento que acabamos de salvar
    const resultadoId =
      await db.query(`
        SELECT last_insert_rowid() AS id
      `);


    const pagamentoId =
      Number(
        resultadoId.values?.[0]?.id
      );


    if (!pagamentoId) {

      throw new Error(
        'Não foi possível identificar o pagamento salvo.'
      );

    }


    // -------------------------------------------------
    // 2. Copia os vales para o histórico
    // -------------------------------------------------

    for (const vale of vales) {

      await db.run(
        `
          INSERT INTO pagamento_vales
          (
            pagamento_id,
            valor,
            data
          )
          VALUES (?, ?, ?)
        `,
        [
          pagamentoId,
          Number(vale.valor),
          vale.data
        ]
      );

    }


    // -------------------------------------------------
    // 3. Zera os dias da nova quinzena
    // -------------------------------------------------

    await db.run(
      `
        UPDATE funcionarios
        SET dias_trabalhados = 0
        WHERE id = ?
      `,
      [funcionarioId]
    );


    // -------------------------------------------------
    // 4. Apaga somente os vales atuais
    // -------------------------------------------------

    await db.run(
      `
        DELETE FROM vales
        WHERE funcionario_id = ?
      `,
      [funcionarioId]
    );


    // Salva no armazenamento do navegador
    await this.databaseService.salvarWeb();


    return {
      pagamentoId,
      totalPago
    };
  }


  // =====================================================
  // HISTÓRICO
  // =====================================================

  async getHistorico() {

    const db =
      await this.databaseService.getBanco();

    const resultado = await db.query(
      `
        SELECT
          id,
          funcionario_id,
          nome,
          funcao,
          diaria,
          dias_trabalhados,
          total_diarias,
          total_vales,
          total_pago,
          data_pagamento
        FROM pagamentos
        ORDER BY id DESC
      `
    );


    return resultado.values ?? [];
  }


  async getPagamentoPorId(
    pagamentoId: number
  ) {

    const db =
      await this.databaseService.getBanco();

    const resultado = await db.query(
      `
        SELECT
          id,
          funcionario_id,
          nome,
          funcao,
          diaria,
          dias_trabalhados,
          total_diarias,
          total_vales,
          total_pago,
          data_pagamento
        FROM pagamentos
        WHERE id = ?
      `,
      [pagamentoId]
    );


    if (
      resultado.values &&
      resultado.values.length > 0
    ) {

      return resultado.values[0];

    }


    return null;
  }


  async getValesPagamento(
    pagamentoId: number
  ) {

    const db =
      await this.databaseService.getBanco();

    const resultado = await db.query(
      `
        SELECT
          id,
          pagamento_id,
          valor,
          data
        FROM pagamento_vales
        WHERE pagamento_id = ?
        ORDER BY data
      `,
      [pagamentoId]
    );


    return resultado.values ?? [];
  }


  // =====================================================
  // LIMPAR SEM HISTÓRICO
  // Mantemos por enquanto, mas não vamos mais usar
  // no botão principal.
  // =====================================================

  async limparPagamento(
    funcionarioId: number
  ) {

    const db =
      await this.databaseService.getBanco();


    await db.run(
      `
        UPDATE funcionarios
        SET dias_trabalhados = 0
        WHERE id = ?
      `,
      [funcionarioId]
    );


    await db.run(
      `
        DELETE FROM vales
        WHERE funcionario_id = ?
      `,
      [funcionarioId]
    );


    await this.databaseService.salvarWeb();
  }


  // =====================================================
  // EXCLUIR FUNCIONÁRIO
  // =====================================================

  async excluirFuncionario(
    funcionarioId: number
  ) {

    const db =
      await this.databaseService.getBanco();


    await db.run(
      `
        DELETE FROM vales
        WHERE funcionario_id = ?
      `,
      [funcionarioId]
    );


    await db.run(
      `
        DELETE FROM funcionarios
        WHERE id = ?
      `,
      [funcionarioId]
    );


    await this.databaseService.salvarWeb();
  }
    async apagarHistorico() {

  const db =
    await this.databaseService.getBanco();


  await db.run(`
    DELETE FROM pagamento_vales
  `);


  await db.run(`
    DELETE FROM pagamentos
  `);


  await this.databaseService.salvarWeb();

}

}