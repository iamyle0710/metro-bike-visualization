import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ChartComponent } from './analysis/chart/chart.component';
import { HeaderComponent } from './header/header.component';
import { MapComponent } from './visualization/map/map.component';
import { StationService } from './core/services/station.service';
import { HourlyChartComponent } from './hourly-chart/hourly-chart.component';
import { StationStatusComponent } from './visualization/station-status/station-status.component';
import { VisualizationComponent } from './visualization/visualization.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { ResizeService } from './core/services/resize.service';

const appRoutes = [
  { path : '', component : VisualizationComponent },
  { path : 'visualization', component : VisualizationComponent },
  { path : 'analysis', component : AnalysisComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    HeaderComponent,
    MapComponent,
    StationStatusComponent,
    HourlyChartComponent,
    VisualizationComponent,
    AnalysisComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    StationService,
    ResizeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
