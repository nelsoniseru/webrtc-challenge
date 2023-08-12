import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoomComponent } from './room/room.component';
import { IndexComponent } from './index/index.component';
const routes: Routes = [
 {path:"", component: IndexComponent },
 { path:"room/:id", component: RoomComponent} 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
