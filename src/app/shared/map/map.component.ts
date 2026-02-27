import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Merchant } from '../models/merchant.model';

declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: `./map.component.html`,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges {
  map!: google.maps.Map;
  circle!: google.maps.Circle;
  defaultCoords = { lat: 57.7089, lng: 11.9746 }; // Göteborg fallback

  private _radius: number = 11; //km - includes Göteborg, Partille and Mölndal

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
  @Input() height: string = '300px';
  @Input() merchants: Merchant[] = [];
  @Output() centerChanged: EventEmitter<{ lat: number; lng: number }> = new EventEmitter();
  @ViewChild('mapElement') mapElement!: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['merchants'] && this.map) {
      this.drawMerchantMarkers(this.merchants);

      if (this.merchants.length === 1) {
        const m = this.merchants[0];
        this.map.setCenter({ lat: m.latitude, lng: m.longitude });
        this.map.setZoom(15);
      }
    }
  }

  ngAfterViewInit(): void {
    this.waitForGoogle().then(() => {
      this.initMap();
    });
  }

  initMap(lat?: number, lng?: number) {
    const center = lat && lng ? { lat, lng } : this.defaultCoords;

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center,
      zoom: 15,
    });
    if (this.merchants && this.merchants.length > 0) {
      this.drawMerchantMarkers(this.merchants);
    }
  }

  // Ritar markörer på kartan, alltid med lista från Dashboard
  drawMerchantMarkers(merchants: Merchant[]) {
    if (!this.map) return;

    // Ta bort gamla markörer
    const existingMarkers = (this as any)._markers || [];
    existingMarkers.forEach((marker: any) => marker.setMap(null));

    const markers: any[] = [];
    merchants.forEach((merchant) => {
      const marker = new google.maps.Marker({
        position: { lat: merchant.latitude, lng: merchant.longitude },
        map: this.map,
        title: merchant.name,
      });
      markers.push(marker);
    });

    (this as any)._markers = markers;
  }

  getMerchantsWithinRadius(center: { lat: number; lng: number }, radiusKm: number): Merchant[] {
    return this.merchants.filter(
      (merchant) =>
        this.distanceBetween(center.lat, center.lng, merchant.latitude, merchant.longitude) <=
        radiusKm,
    );
  }

  private distanceBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  useCurrentPositionOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.initMap(pos.coords.latitude, pos.coords.longitude),
        () => this.initMap(this.defaultCoords.lat, this.defaultCoords.lng),
      );
    } else {
      this.initMap(this.defaultCoords.lat, this.defaultCoords.lng);
    }
  }

  waitForGoogle(): Promise<void> {
    return new Promise((resolve) => {
      const wait = () => {
        if ((window as any).google && (window as any).google.maps) {
          resolve();
        } else {
          setTimeout(wait, 100);
        }
      };
      wait();
    });
  }
}
