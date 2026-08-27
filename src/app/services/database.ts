import { Injectable } from '@angular/core';

import { Capacitor } from '@capacitor/core';

import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private sqlite: SQLiteConnection;

  private db: SQLiteDBConnection | null = null;

  private nomeBanco = 'controle_obra';

  private inicializado = false;

  private inicializacaoPromise:
    Promise<void> | null = null;


  constructor() {

    this.sqlite = new SQLiteConnection(
      CapacitorSQLite
    );

  }


  async inicializar(): Promise<void> {

    if (
      this.inicializado &&
      this.db
    ) {
      return;
    }


    if (this.inicializacaoPromise) {

      await this.inicializacaoPromise;

      return;
    }


    this.inicializacaoPromise =
      this.fazerInicializacao();


    try {

      await this.inicializacaoPromise;

    } finally {

      this.inicializacaoPromise = null;

    }

  }


  private async fazerInicializacao():
    Promise<void> {

    const plataforma =
      Capacitor.getPlatform();


    // Configuração necessária somente no navegador
    if (plataforma === 'web') {

      let jeepSqlite =
        document.querySelector(
          'jeep-sqlite'
        );


      if (!jeepSqlite) {

        jeepSqlite =
          document.createElement(
            'jeep-sqlite'
          );

        document.body.appendChild(
          jeepSqlite
        );

      }


      await customElements.whenDefined(
        'jeep-sqlite'
      );


      await this.sqlite.initWebStore();

    }


    const consistencia =
      await this.sqlite
        .checkConnectionsConsistency();


    const conexaoExiste =
      await this.sqlite.isConnection(
        this.nomeBanco,
        false
      );


    if (
      consistencia.result &&
      conexaoExiste.result
    ) {

      this.db =
        await this.sqlite
          .retrieveConnection(
            this.nomeBanco,
            false
          );

    } else {

      this.db =
        await this.sqlite
          .createConnection(
            this.nomeBanco,
            false,
            'no-encryption',
            1,
            false
          );

    }


    await this.db.open();


    const sql = `

      PRAGMA foreign_keys = ON;


      CREATE TABLE IF NOT EXISTS funcionarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        funcao TEXT NOT NULL,
        diaria REAL NOT NULL,
        dias_trabalhados INTEGER NOT NULL DEFAULT 0
      );


      CREATE TABLE IF NOT EXISTS vales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        funcionario_id INTEGER NOT NULL,
        valor REAL NOT NULL,
        data TEXT NOT NULL,

        FOREIGN KEY (funcionario_id)
          REFERENCES funcionarios(id)
          ON DELETE CASCADE
      );


      CREATE TABLE IF NOT EXISTS pagamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        funcionario_id INTEGER,

        nome TEXT NOT NULL,

        funcao TEXT NOT NULL,

        diaria REAL NOT NULL,

        dias_trabalhados INTEGER NOT NULL,

        total_diarias REAL NOT NULL,

        total_vales REAL NOT NULL,

        total_pago REAL NOT NULL,

        data_pagamento TEXT NOT NULL
      );


      CREATE TABLE IF NOT EXISTS pagamento_vales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        pagamento_id INTEGER NOT NULL,

        valor REAL NOT NULL,

        data TEXT NOT NULL,

        FOREIGN KEY (pagamento_id)
          REFERENCES pagamentos(id)
          ON DELETE CASCADE
      );

    `;


    await this.db.execute(sql);


    await this.salvarWeb();


    this.inicializado = true;


    console.log(
      'Banco SQLite inicializado com sucesso!'
    );

  }


  async getBanco():
    Promise<SQLiteDBConnection> {

    await this.inicializar();

    return this.db!;

  }


  async salvarWeb():
    Promise<void> {

    if (
      Capacitor.getPlatform() === 'web'
    ) {

      await this.sqlite.saveToStore(
        this.nomeBanco
      );

    }

  }

}