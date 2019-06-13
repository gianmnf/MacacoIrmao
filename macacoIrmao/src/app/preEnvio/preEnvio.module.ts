import { MbscModule } from '@mobiscroll/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PreEnvioPage } from './preEnvio.page';
import { ModalPreviewPage} from '../modal-preview/modal-preview.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [ 
    MbscModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: 'preEnvio',
        component: PreEnvioPage
      }
    ])
  ],
  declarations: [PreEnvioPage,ModalPreviewPage],
  entryComponents: [ModalPreviewPage]
})
export class PreEnvioPageModule {}
