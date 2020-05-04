import { Component, OnInit } from '@angular/core'
import { ModalController, NavParams, ToastController } from '@ionic/angular'
import { buildGPX, GarminBuilder } from 'gpx-builder'
import ejs from 'ejs'
import { environment } from '../../environments/environment'

@Component({
  selector: 'app-export',
  templateUrl: './export.page.html',
  styleUrls: ['./export.page.scss'],
})
export class ExportPage implements OnInit {
  route: any;

  hostname = environment.hostname;

  noteData = [];

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    public toastController: ToastController,
  ) { }

  ngOnInit() {
    this.route = this.navParams.get('route')
    this.noteData = this.navParams.get('noteData')
  }

  async copy() {
    const pastemaphtml = document.getElementById('pastemaphtml') as HTMLTextAreaElement
    pastemaphtml.select()
    document.execCommand('copy')
    await this.presentToast('クリップボードのコピーしました')
  }

  async closeModal() {
    await this.modalController.dismiss()
  }

  exportGpx() {
    const { Metadata, Person, Point } = GarminBuilder.MODELS
    const { route } = this

    const meta = new Metadata({
      name: route.title,
      author: new Person({
        name: route.author,
      }),
      //      link
    })

    const points = []
    for (let i = 0; i < route.pos.length; i++) {
      const pos = route.pos[i]
      points.push(
        new Point(pos[1], pos[0], {
          ele: pos[2],
          // なにか追加したいデータあればする。
          // time: new Date('2018-06-10T17:29:35Z'),
          // hr: 120,
        }),
      )
    }
    const gpxData = new GarminBuilder()
    gpxData.setMetadata(meta)
    gpxData.setSegmentPoints(points)

    const wpts = []
    for (let j = 0; j < this.noteData.length; j++) {
      const n = this.noteData[j]
      wpts.push(
        new Point(n.pos[0], n.pos[1], { name: n.cmd, cmt: n.cmt }),
      )
    }
    if (wpts.length > 0) {
      gpxData.setWayPoints(wpts)
    }
    const gpxString = buildGPX(gpxData.toObject())

    const blob = new Blob([gpxString], { type: 'application/gpx+xml' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${route.title}.gpx`
    link.click()
  }


  private kmlTemplate = `
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
<Document>
<name><%=title%></name>
<atom:author>
<atom:name><%=author%></atom:name>
</atom:author>
<atom:link href="<%=link%>" />
<description><![CDATA[<%=body%>]]></description>
<Placemark>
<Style>
<LineStyle>
<color>99ff0000</color>
<width>6</width>
</LineStyle>
</Style>
<LineString>
<coordinates>
<%=coordinates%>
</coordinates>
</LineString>
</Placemark>
</Document>
</kml>`;

  exportKml() {
    const { route } = this
    const kmlString = ejs.render(this.kmlTemplate, {
      title: route.title,
      author: route.author,
      link: '',
      body: route.body,
      coordinates: route.pos.map((p) => p.join(',')).join('\n'),
    })

    const blob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${route.title}.kml`
    link.click()
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'primary',
    })
    toast.present()
  }
}
