import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './commandes.html',
  styleUrl: './commandes.css'
})
export class Commandes {
}