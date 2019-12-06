import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app.component';
import { ChartComponent } from './analysis/chart/chart.component';
import { HeaderComponent } from './header/header.component';
import { MapComponent } from './visualization/map/map.component';
import { StationService } from './core/services/station.service';
import { StationStatusComponent } from './visualization/station-status/station-status.component';
import { VisualizationComponent } from './visualization/visualization.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { ResizeService } from './core/services/resize.service';
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
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    RouterModule.forRoot(appRoutes),
    FontAwesomeModule
  ],
  providers: [
    StationService,
    ResizeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
