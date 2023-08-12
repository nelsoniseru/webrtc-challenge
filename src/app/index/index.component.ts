import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent {
  constructor(private router: Router) { }

  startMeeting(): void {
    const roomId = Math.random().toString(36).substr(2, 9);
    this.router.navigate(['/room', roomId]);
  }
}
