import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  standalone: true,
})
export class LayoutComponent {

}
