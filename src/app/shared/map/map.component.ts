import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: `./map.component.html`,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('locationInput') locationInput!: ElementRef;

  apiKey = 'AIzaSyD2SuMGC6eoAsofz21EvyubGsm7rDu22IE';

  // Google Maps
  map: any;
  circle: any;
  defaultCoords = { lat: 57.7089, lng: 11.9746 }; // Göteborg fallback

  private _radius: number = 10;

  @Input()
  set radius(value: number) {
    this._radius = value;
    if (this.circle) {
      this.circle.setRadius(this._radius * 1000);
    }
  }

  get radius(): number {
    return this._radius;
  }

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const waitForGoogle = () => {
      if ((window as any)['google'] && (window as any)['google'].maps) {
        this.useCurrentPositionOnInit();
      } else {
        setTimeout(waitForGoogle, 100);
      }
    };
    waitForGoogle();
  }

  // --- Google Maps ---
  initMap(lat: number, lng: number) {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat, lng },
      zoom: 13,
    });
    this.drawCircle(lat, lng);
  }

  drawCircle(lat: number, lng: number) {
    if (this.circle) this.circle.setMap(null);

    this.circle = new google.maps.Circle({
      strokeColor: '#28a745',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#28a754',
      fillOpacity: 0.2,
      map: this.map,
      center: { lat, lng },
      radius: this.radius * 1000,
    });

    const userMarker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      title: 'Din position',
    });

    this.map.setCenter({ lat, lng });
  }

  updateRadius() {
    if (this.circle) {
      this.circle.setRadius(this.radius);
    }
  }

  useCurrentPositionOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.initMap(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.warn('Geolocation failed or denied', err);
          this.initMap(this.defaultCoords.lat, this.defaultCoords.lng);
        },
      );
    } else {
      this.initMap(this.defaultCoords.lat, this.defaultCoords.lng);
    }
  }

  searchCity() {
    const city = (this.locationInput.nativeElement as HTMLInputElement).value;
    if (!city) return;

    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=AIzaSyD2SuMGC6eoAsofz21EvyubGsm7rDu22IE`,
    )
      .then((res) => res.json())
      .then((data: any) => {
        if (data.results && data.results.length > 0) {
          const loc = data.results[0].geometry.location;
          this.drawCircle(loc.lat, loc.lng);
        } else {
          alert('Staden hittades inte.');
        }
      })
      .catch((err) => console.error(err));
  }
}
