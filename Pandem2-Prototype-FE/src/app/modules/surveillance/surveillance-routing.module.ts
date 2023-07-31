/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as fromPages from './pages';
import { AuthManagementGuard } from '../../core/services/guards/auth-management.guard';
import { PERMISSION } from '../../core/models/permission.model';
import { UserSettingsResolver } from '../../core/services/resolvers/user-settings.resolver';

const routes: Routes = [
  // Cases
  {
    path: 'cases',
    component: fromPages.CasesComponent,
    canActivate: [AuthManagementGuard],
    data: {
      permissions: [PERMISSION.CASES_ALL]
    },
    resolve: [UserSettingsResolver]
  },
  // Deaths
  {
    path: 'deaths',
    component: fromPages.DeathsComponent,
    canActivate: [AuthManagementGuard],
    data: {
      permissions: [PERMISSION.DEATHS_ALL]
    },
    resolve: [UserSettingsResolver]
  },
  // Participatory Surveillance
  {
    path: 'participatory-surveillance',
    component: fromPages.ParticipatorySurveillanceComponent,
    canActivate: [AuthManagementGuard],
    data: {
      permissions: [PERMISSION.PARTICIPATORY_SURVEILLANCE_ALL]
    },
    resolve: [UserSettingsResolver]
  },
  // Primary Care
  {
    path: 'primary-care',
    component: fromPages.PrimaryCareComponent,
    canActivate: [AuthManagementGuard],
    data: {
      permissions: [PERMISSION.PRIMARY_CARE_ALL]
    },
    resolve: [UserSettingsResolver]
  },
  // Flights
  {
    path: 'flights',
    component: fromPages.FlightsComponent,
    canActivate: [AuthManagementGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurveillanceRoutingModule {
}
