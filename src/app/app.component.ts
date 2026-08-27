import { Component, OnInit } from '@angular/core';

import {
  IonApp,
  IonRouterOutlet
} from '@ionic/angular';

import { DatabaseService } from './services/database';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonRouterOutlet
  ],
})
export class AppComponent implements OnInit {

  constructor(
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {

    try {

      await this.databaseService.inicializar();

      console.log(
        'SQLite pronto para uso!'
      );

    } catch (erro) {

      console.error(
        'Erro ao iniciar SQLite:',
        erro
      );

    }

  }

}