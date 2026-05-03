import { Component } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterModule} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor() {
  }
}