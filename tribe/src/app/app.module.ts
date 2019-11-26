import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { HeaderComponent } from './header/header.component';
import { MapComponent } from './map/map.component';
import { StationService } from './core/services/station.service';
import { StationStatusComponent } from './station-status/station-status.component';

const appRoutes = [
  { path : '', component : ChartComponent },
  { path : 'map', component : MapComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    HeaderComponent,
    MapComponent,
    StationStatusComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    StationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
