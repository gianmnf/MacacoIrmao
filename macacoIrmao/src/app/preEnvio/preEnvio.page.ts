import { Component, OnInit } from '@angular/core';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Ocorrencia } from '../modelos/ocorrencia';
import { AngularFireAuth } from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {NavController,Platform, PopoverController} from '@ionic/angular'; 
import { Camera,CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder,NativeGeocoderOptions,NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import {GoogleMaps, GoogleMap, GoogleMapsEvent, Marker, GoogleMapsAnimation, MyLocation} from '@ionic-native/google-maps';
import {ModalController} from '@ionic/angular';
import {ModalPreviewPage} from '../modal-preview/modal-preview.page';

@Component({
  selector: 'app-preEnvio',
  templateUrl: 'preEnvio.page.html',
  styleUrls: ['preEnvio.page.scss'],
})

export class PreEnvioPage implements OnInit{
  public downloadUrl:Observable<string>;
  lat: number;
  long: number;
  ocorrencia = {} as Ocorrencia;
  user: string;
  hashOcorrencia: string;
  map: GoogleMap;
  local:string;
  public localCompleto:string;
  constructor(private webview: WebView,private afAuth: AngularFireAuth, private navCtrl: NavController, 
    private afs: AngularFirestore, private camera: Camera,private platform: Platform, private file: File,
    private afStorage: AngularFireStorage, private geo: Geolocation, private natGeo: NativeGeocoder,
    private modalController: ModalController){
  }

  ngOnInit(){
    this.hashGen();
    this.platform.ready();
    this.carregaMapa();
    this.tirarFoto();
  }

  hashGen(){
    this.hashOcorrencia = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  enviado(){
    this.navCtrl.navigateForward('/enviado');
  }

   enviarDados(){
    this.afAuth.authState.subscribe(auth => {
      this.ocorrencia.idUsuario = auth.uid;
      this.ocorrencia.idOcorrencia = this.hashOcorrencia;
      this.ocorrencia.status = 'Não visitado';
      var setOcorrencia = this.afs.collection('ocorrencia').doc(this.hashOcorrencia).set(this.ocorrencia);
      setOcorrencia.then(() => this.enviado());
    })
   }

   async tirarFoto(){
      const options: CameraOptions = {
        quality: 70,
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: this.camera.PictureSourceType.CAMERA,
        correctOrientation: true
      };

      try{
        const fileUri: string = await this.camera.getPicture(options);
        let file: string;
        file = fileUri.split('/').pop();
        const path: string = fileUri.substring(0, fileUri.lastIndexOf('/'));
        const buffer: ArrayBuffer = await this.file.readAsArrayBuffer(path,file);
        const blob: Blob = new Blob([buffer], {type: 'image/jpeg'});
        this.uploadFoto(blob);
      }catch(error){
        console.log(error);
      }
   }

   uploadFoto(blob: Blob){
      const ref = this.afStorage.ref('ocorrencias/' + this.hashOcorrencia + '.jpg');
      const task = ref.put(blob);

      task.snapshotChanges().pipe(
        finalize(() => this.downloadUrl = ref.getDownloadURL())
      ).subscribe();
   }

  //Localização
  buscaEndereco(){
    this.map.clear();
    this.map.getMyLocation().then((local:MyLocation)=> {
      let marker: Marker = this.map.addMarkerSync({
        title: 'App Febre Amarela',
        snippet: 'Você está aqui!',
        position: local.latLng,
        animation: GoogleMapsAnimation.BOUNCE
      });
      this.map.animateCamera({
        target: local.latLng,
        zoom: 17,
        duration: 5000
      });
      marker.showInfoWindow();
    this.lat = local.latLng.lat;
    this.long = local.latLng.lng;
    this.ocorrencia.latitude = this.lat;
    this.ocorrencia.longitude = this.long;
    this.geraEndereco(this.lat,this.long);
    }).catch((error) => {
      console.log(error);
    })
  }

  geraEndereco(latitude:number,longitude:number){
    this.natGeo.reverseGeocode(latitude,longitude,{useLocale:true,maxResults:1})
    .then((resultado: NativeGeocoderResult[]) => {
      this.ocorrencia.logradouro = resultado[0].thoroughfare + ' ' + resultado[0].subThoroughfare;
      this.ocorrencia.municipio = resultado[0].locality;
      this.ocorrencia.cep = resultado[0].postalCode;
      this.ocorrencia.pais = resultado[0].countryName;
      this.ocorrencia.estado = resultado[0].administrativeArea;
    })
  }

  carregaMapa(){
    this.map = GoogleMaps.create('map_canvas',{});
    this.buscaEndereco();
  }

  //Preview Imagem
  async modPreview(){
    console.log(this.downloadUrl);
    const modal = await this.modalController.create({
      component: ModalPreviewPage,
      componentProps:{
        urlIMG: this.downloadUrl
      }
    });
    await modal.present();
  }


}
