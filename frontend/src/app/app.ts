import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- 1. Ajout de ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App{
}