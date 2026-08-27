import { bootstrapApplication } from '@angular/platform-browser';

import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules
} from '@angular/router';

import {
  IonicRouteStrategy,
  provideIonicAngular
} from '@ionic/angular';

import {
  defineCustomElements as jeepSqlite
} from 'jeep-sqlite/loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';


async function iniciarApp() {

  jeepSqlite(window);

  await customElements.whenDefined('jeep-sqlite');

  await bootstrapApplication(AppComponent, {
    providers: [
      {
        provide: RouteReuseStrategy,
        useClass: IonicRouteStrategy
      },

      provideIonicAngular(),

      provideRouter(
        routes,
        withPreloading(PreloadAllModules),
        withComponentInputBinding()
      )
    ],
  });

}


iniciarApp().catch(
  erro => console.error(erro)
);