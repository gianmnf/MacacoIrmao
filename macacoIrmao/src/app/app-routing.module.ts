import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'envios',
    loadChildren: './envios/envios.module#EnviosPageModule'
  },
  {
    path: 'localizacao',
    loadChildren: './localizacao/localizacao.module#LocalizacaoPageModule'
  },
  {
    path: 'sobre',
    loadChildren: './sobre/sobre.module#SobrePageModule'
  },
  {
    path: '',
    loadChildren: './preEnvio/preEnvio.module#PreEnvioPageModule'
  },
  { path: 'enviado', loadChildren: './enviado/enviado.module#EnviadoPageModule' },
  { path: 'login', loadChildren: './autenticacao/login/login.module#LoginPageModule' },
  { path: 'registro', loadChildren: './autenticacao/registro/registro.module#RegistroPageModule' },
  { path: 'perfil', loadChildren: './autenticacao/perfil/perfil.module#PerfilPageModule' },
  { path: 'modal-preview', loadChildren: './modal-preview/modal-preview.module#ModalPreviewPageModule' },  { path: 'saiba-mais', loadChildren: './saiba-mais/saiba-mais.module#SaibaMaisPageModule' }



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
