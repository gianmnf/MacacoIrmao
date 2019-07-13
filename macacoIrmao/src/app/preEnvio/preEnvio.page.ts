import { Component, OnInit } from '@angular/core';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Ocorrencia } from '../modelos/ocorrencia';
import { AngularFireAuth } from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {NavController,Platform, PopoverController,NavParams} from '@ionic/angular'; 
import { Camera,CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize, timestamp } from 'rxjs/operators';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder,NativeGeocoderOptions,NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import {GoogleMaps, GoogleMap, GoogleMapsEvent, Marker, GoogleMapsAnimation, MyLocation} from '@ionic-native/google-maps';
import {ModalController} from '@ionic/angular';
import {ModalPreviewPage} from '../modal-preview/modal-preview.page';
import * as firebase from 'firebase';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import  { HTTP } from '@ionic-native/http/ngx';

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
  envioPronto:boolean;
  dataReturned: any;
  public FormDados: FormGroup;
  public tentativaEnvio: boolean = false;
  public mostraErro: boolean = false;
  constructor(private webview: WebView,private afAuth: AngularFireAuth, private navCtrl: NavController, 
    private afs: AngularFirestore, private camera: Camera,private platform: Platform, private file: File,
    private afStorage: AngularFireStorage, private geo: Geolocation, private natGeo: NativeGeocoder,
    private modalController: ModalController,public formBuilder: FormBuilder,private http: HTTP){
  }

  ngOnInit(){
    this.platform.ready();
    this.carregaMapa();
    this.tirarFoto();
    this.getDadosUser();
    this.formValidation();
  }  

  formValidation(){
    this.FormDados = this.formBuilder.group({
      imageUrl: new FormControl('', Validators.required),
      latitude: new FormControl('', Validators.required),
      longitude: new FormControl('', Validators.required),
      nomeSobrenome: new FormControl('', Validators.required),
      celular: new FormControl('', Validators.required),
      pontoReferencia: new FormControl('', Validators.required),
      bairro: new FormControl('', Validators.required),
      municipio: new FormControl('', Validators.required),
      estado: new FormControl('', Validators.required),
      zona: new FormControl('', Validators.required),
      pais: new FormControl('', Validators.required),
      estadoAnimal: new FormControl('', Validators.required),
    });
  }

  enviado(){
    this.navCtrl.navigateForward('/enviado');
  }

   enviarDados(){
    this.afAuth.authState.subscribe(auth => {
      this.ocorrencia.idUsuario = auth.uid;
      this.ocorrencia.status = 'A Visitar';
      let id = this.afs.createId();
      var setOcorrencia = this.afs.collection('ocorrencia').doc(id).set(this.ocorrencia);
      setOcorrencia.then(() => this.enviado());
    })
   }

   getMunicipio(cep){
      var urlCEP = 'https://viacep.com.br/ws/' + cep + '/json/';
      this.http.get(urlCEP,{},{}).then(data => {
        var dadosRecebidos = JSON.parse(data.data);
        this.ocorrencia.municipio = dadosRecebidos.localidade;
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
      this.ocorrencia.cep = resultado[0].postalCode;
      this.ocorrencia.pais = resultado[0].countryName;
      this.ocorrencia.estado = resultado[0].administrativeArea;
      this.getMunicipio(this.ocorrencia.cep);
    })
  }

  carregaMapa(){
    this.map = GoogleMaps.create('map_canvas',{});
    this.buscaEndereco();
  }

  //Preview Imagem
  async modPreview(url){
    const modal = await this.modalController.create({
      component: ModalPreviewPage,
      componentProps:{
        "urlIMG": JSON.stringify(url)
      }
    });
    modal.onDidDismiss().then((dataReturned) => {
      if(dataReturned != null){
        this.dataReturned = dataReturned.data;
      }
    })
    await modal.present();
  }

  getDadosUser(){
    this.afAuth.authState.subscribe(auth => {
      var getDados = this.afs.collection('perfil').doc(auth.uid).ref;
      getDados.get().then(doc => {
        this.ocorrencia.nomeSobrenome = doc.data().nome + ' ' + doc.data().sobrenome;
        this.ocorrencia.celular = doc.data().celular;
      })
    })
  }
}
