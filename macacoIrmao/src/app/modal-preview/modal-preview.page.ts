import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-preview',
  templateUrl: './modal-preview.page.html',
  styleUrls: ['./modal-preview.page.scss'],
})
export class ModalPreviewPage implements OnInit {
  public urlIMG:string;
  constructor(private modalController:ModalController) { }

  ngOnInit() {
  }

  dismiss(){
    this.modalController.dismiss();
  }

}
