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
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthManagementDataService } from '../auth-management-data.service';
import { Constants } from '../../models/constants';
import { CustomToastService } from '../helper/custom-toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthManagementGuard implements CanActivate {
  /**
   * Constructor
   */
  constructor(
    private authDataService: AuthManagementDataService,
    private router: Router,
    private customToast: CustomToastService
  ) {
  }

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // get the authenticated user
    const user = this.authDataService.getAuthenticatedUser();

    // check if user is authenticated
    if (user) {
      // check if there are any permissions defined on route
      const routePermissions = (_route && _route.data && _route.data.permissions) ? _route.data.permissions : [];

      // check if user has the required permissions
      if (Array.isArray(routePermissions)) {
        if (
          routePermissions.length < 1 ||
          user.hasPermissions(...routePermissions)
        ) {
          return true;
        }
      } else {
        if (user.hasPermissions(...[routePermissions])) {
          return true;
        }
      }

      this.customToast.showError('User does not have the required permissions to access this page.');
      this.router.navigate(['/']);
      return false;
    } else {
      // not logged in so redirect to login page
      this.router.navigate([Constants.LOGIN_USER_URL]);
      return false;
    }
  }

}
