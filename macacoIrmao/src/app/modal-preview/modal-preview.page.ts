import { Component, OnInit } from '@angular/core';
import { ModalController,NavParams } from '@ionic/angular';

@Component({
  selector: 'app-modal-preview',
  templateUrl: './modal-preview.page.html',
  styleUrls: ['./modal-preview.page.scss'],
})
export class ModalPreviewPage implements OnInit {
  public urlIMG: string;
  constructor(private modalController:ModalController,private navParams:NavParams) { }

  ngOnInit() {
    this.urlIMG = this.navParams.data.urlIMG;
  }

  dismiss(){
    this.modalController.dismiss();
  }

}
