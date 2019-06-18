import { Component, OnInit } from '@angular/core';
import { AngularFirestore,AngularFirestoreDocument } from '@angular/fire/firestore';
import { AutenticacaoService } from '../services/autenticacao.service';
import { Observable } from 'rxjs';
import { MenuController,Platform,AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth'; 
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';

export interface Item { nome:String;}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage implements OnInit{
  public nome: string;
  user: string;
  constructor(private afs: AngularFirestore,
    private authService:AutenticacaoService,
    private menu:MenuController,
    private afAuth: AngularFireAuth,
    private androidPermissions: AndroidPermissions,
    private platform: Platform,
    private alertCtrl: AlertController) {
  }
  ngOnInit(){
    this.menu.enable(true);
    this.checarPermissoes();
    this.getUserData();
    this.inicializarBotaoVoltar();
  }

  getUserData(){
    this.afAuth.authState.subscribe(auth => {
      this.user = auth.uid;
      var getUser = this.afs.collection('perfil').doc(this.user);
      getUser.ref.get().then((doc) =>{
        if (doc.exists) {
           this.nome = doc.data().nome;
        } else {
          console.log('Oops');
        }
    }).catch(function(error) {
        console.log("Erro ao obter documento:", error);
    })      
    })
  }

  async checarPermissoes(){
   this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, 
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
      this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE, 
      this.androidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION,
      this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
      this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION]);
  }

  //Adiciona ação para confirmar se deseja sair com o botão voltar
  public unsubscribeBackEvent: any;

  inicializarBotaoVoltar() : void{
    this.unsubscribeBackEvent = this.platform.backButton.subscribeWithPriority(999999, () => {
      this.alerta();
    })
  }

  ionViewWillLeave() {
    this.unsubscribeBackEvent && this.unsubscribeBackEvent();
  }

  async alerta(){
    const alert = await this.alertCtrl.create({
      header: 'Deseja Sair?',
      message: 'Você deseja sair do Aplicativo?',
      buttons: [
        {
          text: 'Não',
          role: 'cancel',
          handler: () => {
            console.log('Não saiu');
          }
        },
        {
          text: 'Sim',
          handler: () => {
            navigator['app'].exitApp();
          }
        }
      ]
    });
    alert.present();
  }

}
