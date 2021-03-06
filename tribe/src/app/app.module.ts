import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { StationService } from './core/services/station.service';
import { ResizeService } from './core/services/resize.service';
import { LocationService } from './core/services/location.service';
import { AppComponent } from './app.component';
import { ChartComponent } from './analysis/chart/chart.component';
import { HeaderComponent } from './header/header.component';
import { MapComponent } from './visualization/map/map.component';
import { StationStatusComponent } from './visualization/station-status/station-status.component';
import { VisualizationComponent } from './visualization/visualization.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { TeamComponent } from './team/team.component';
import { WelcomeComponent } from './welcome/welcome.component';

const appRoutes = [
  { path : '', component : WelcomeComponent },
  { path : 'visualization', component : VisualizationComponent },
  { path : 'analysis', component : AnalysisComponent},
  { path : 'team', component : TeamComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    HeaderComponent,
    MapComponent,
    StationStatusComponent,
    VisualizationComponent,
    AnalysisComponent,
    TeamComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule,    
    FontAwesomeModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    StationService,
    ResizeService,
    LocationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
