import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tileLayer, geoJSON } from 'leaflet';
import { findIndex, isMatch, minBy, maxBy } from 'lodash';

import { UIService } from 'src/app/services/ui.service';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertMessagesService } from 'src/app/services/alert-messages.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @ViewChild('map') mapElement: ElementRef;
  tileUrl = 'http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
  tileAttribution = 'Map data <a href="http://openstreetmap.org">© OpenStreetMap</a> contributors';
  geoJsonUrl = '/assets/campus.json';
  mapRef: L.Map;
  mapLayer: L.GeoJSON;
  mapLayerData: any;
  // double click event handling data
  clicked = 0;
  defualtStyle = {
    'color': 'rgb(0,0,0)',
    'weight': 1,
    'opacity': 0.2,
    'stroke-width': 1,
    'stroke-opacity': 1,
  };


  constructor(private http: HttpClient, public dataManagerService: DataManagerService,
    public uiService: UIService, private authService: AuthService,
    private alertMessagesService: AlertMessagesService) {
  }

  async ngOnInit() {

    await this.http.get(this.geoJsonUrl).subscribe(async (data) => {
      this.mapLayerData = data;
      await this.createMap(this.mapElement.nativeElement);
      this.updateLayer();
      // on buildings data update
      await this.dataManagerService.allBuildingsLatestData.subscribe(async datas => {
        try {
          // console.log(datas)
          this.mapLayerData.features = await Promise.all(this.mapLayerData.features.map(e => {
            const indexInDatas = findIndex(datas.values, (building: any) => {
              return isMatch(building.name, e.properties.name);
            });
            Object.assign(e.properties, { min: datas.min, max: datas.max, unit: datas.unit });
            if (indexInDatas === -1) {
              e.properties = {
                image: e.properties.image,
                name: e.properties.name,
                surface: e.properties.surface,
                year_construction: e.properties.year_construction
              };
              return e;
            } else {
              e.properties.current_value = Number(datas.values[indexInDatas].data[0].value);
              e.properties.hidden = datas.values[indexInDatas].hidden;
              return e;
            }
          }));
          this.updateLayer();

        } catch (err) {
          // this.alertMessagesService.pushErrorMessage('Problem de connexion!');
        }
      });
    }, () => {
      this.alertMessagesService.pushErrorMessage('Problem de connexion!');
    });
    this.dataManagerService.choosedBuildings.subscribe(() => {
      this.updateLayer();
    });
    // update latest data every 2 min
/*     setInterval(() => {
      // update latest buildings data
      this.dataManagerService.updateLatestBuildings();
      // update selected buildings data
      // this.dataManagerService.updateSelectedBuildings();
    }, 1000 * 60 * 2); // 2 min
 */  }
  clickEventHandler(layer) {
    layer.on("click", (event) => {
      layer.togglePopup();
      this.clicked++;
      // one
      setTimeout(() => {
        if (this.clicked === 1) {
          layer.togglePopup();

          this.clicked = 0;
        }
      }, 800);
    });
    layer.on('dblclick', (event) => {
      this.clicked = 0;
      // add building to data manager
      // console.log(event.target.feature.properties.name)
      this.dataManagerService.toggleBuilding(event.target.feature.properties.name);
      // layer.setStyle({ fillColor: 'red' });
    });
    layer.on('contextmenu', (event) => {
      // layer.setStyle({ fillColor: 'red' });

    });
  }
  async createMap(target: HTMLElement) {
    const mapZoomLevel = 17
    const campusCordinates = [43.56091, 1.46848]
    // create map component (TODO: change setView )
    this.mapRef = map(target).setView([campusCordinates[0], campusCordinates[1]], mapZoomLevel);
    this.mapRef.doubleClickZoom.disable();
    // set tile source (map main data)
    tileLayer(this.tileUrl, {
      attribution: this.tileAttribution,
    }).addTo(this.mapRef);
    return;

    // get custom geoJson for campus
  }
  async updateLayer() {
    if (this.mapRef) {
      this.mapRef.eachLayer((layer: any) => {
        if (layer._url !== this.tileUrl) {
          this.mapRef.removeLayer(layer)
        }
      });
    }
    const buildings = this.dataManagerService.choosedBuildings.value;
    if (!this.mapLayerData) {
      return;
    }
    this.mapLayerData.features = await Promise.all(this.mapLayerData.features.map(feature => {
      feature.properties.index = undefined;
      return feature;
    }));
    await Promise.all(buildings.map(async (building, index) => {
      if (!this.mapLayerData) {
        return;
      }
      const indexInMapLayerData = findIndex(this.mapLayerData.features, (feature: any) => feature.properties.name === building);
      if (indexInMapLayerData !== -1) {
        this.mapLayerData.features[indexInMapLayerData].properties['index'] = index;
      }
    }));
    this.mapLayer = geoJSON(this.mapLayerData,
      {
        style: this.featureStyle.bind(this),
        onEachFeature: (feature, layer) => {
          // console.log(feature);
          // One click event
          // TODO: Consomation actuelle
          const consoToHtml = (feauture) => {
            if (feature.properties.current_value != undefined) {
              const res: any = Number(feature.properties.current_value);
              if (res != undefined && !isNaN(res)) {
                return `
				  <div class="col m-3">
				  <div>Consomation actuelle</div>
				  <div>
				  ${res + ' ' + feature.properties.unit}
				  </div>
				  </div>
				  `;
              } else {
                return `<div class="col m-3">
              </div>`;
              }
            } else {
              return `<div class="col m-3">
              </div>`;
            }
          };
          layer.bindPopup(
            `
          <div style="border-radius: 12px; overflow:hidden; color:white;">
          <div>
          <img src='${feature.properties.image}' style="width:20em; margin:auto; position:relative;" />
          <h3 style="position:absolute; top: .5rem; left: .5rem;color:white; text-shadow: 0 0 15px rgba(30,30,30,0.6);  ">
          ${feature.properties.name}
          </h3>
          </div>
          <div class="row center">
          <div class="col m-3">
          <div>Année de construction</div>
          <div>${feature.properties.year_construction}</div>
          </div>
          <div class="col m-3">
          <div>superficie</div>
          <div>${feature.properties.surface}</div>
          </div>
          </div>
          <div class="row center">
          ${consoToHtml(feature)}
          <div class="col m-3">
          </div>
          </div>
          </div>
          `, {
              maxWidth: this.uiService.rem(25),
              minWidth: this.uiService.rem(12),
              className: "custom-popup"
            });
          this.clickEventHandler(layer);
        }
      });
    if (this.mapRef) {
      this.mapRef.addLayer(this.mapLayer);
    }
  }

  featureStyle(feature) {

    const percentColors = [
      { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
      { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
      { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } }];

    const getColorForPercentage = function (value, min, max) {
      const pct = 1 - value / (max - min);
      let i;
      for (i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
          break;
        }
      }
      const lower = percentColors[i - 1];
      const upper = percentColors[i];
      const range = upper.pct - lower.pct;
      const rangePct = (pct - lower.pct) / range;
      const pctLower = 1 - rangePct;
      const pctUpper = rangePct;
      const color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
      };
      return 'rgb(' + [color.r / (color.g > color.r ? 1.1 : 1.4), color.g < 100 && color.r > 100 ? 0 : color.g / 1.8, color.b].join(',') + ')';
      // or output as hex if preferred
    };
    if (feature.properties.index != undefined) {
      return {
        fillColor: this.uiService.colors[feature.properties.index],
        color: this.uiService.colors[feature.properties.index],
        opacity: 1,
        fillOpacity: .8
      };
    }
    if (feature.properties.current_value != undefined && feature.properties.hidden !== true) {
      return {
        fillColor: getColorForPercentage(feature.properties.current_value, feature.properties.min, feature.properties.max + 1),
        color: 'rgba(0,0,0,0)',
        fillOpacity: .8
      };
    } else {
      return {
        fillColor: '#000',
        color: 'rgba(0,0,0,0)',

      };
    }

  }
}
