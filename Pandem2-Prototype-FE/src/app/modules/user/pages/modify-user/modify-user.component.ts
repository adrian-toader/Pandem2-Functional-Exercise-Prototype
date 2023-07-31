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
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';
import { BreadcrumbItemModel } from '../../../../shared/components/breadcrumbs/breadcrumb-item.model';
import { UserRoleDataService } from '../../../../core/services/data/user-role.data.service';
import { UserModel, UserRoleModel } from '../../../../core/models/user.model';
import { UserDataService } from '../../../../core/services/data/user.data.service';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { FormHelperService } from '../../../../core/services/helper/form-helper.service';
import * as _ from 'lodash';
import { ViewModifyComponent } from '../../../../core/helperClasses/view-modify-component';
import { DialogService } from '../../../../core/services/helper/dialog.service';
import { catchError, map, tap } from 'rxjs/operators';
import { RequestQueryBuilder } from '../../../../core/helperClasses/request-query-builder';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { RegionModel } from '../../../../core/models/region.model';
import { NutsDataService } from '../../../../core/services/data/nuts.data.service';
import * as moment from 'moment';
import { DateFormatISODate } from '../../../../shared/constants';
import { StorageKey, StorageService } from '../../../../core/services/helper/storage.service';
import { LocalSessionModel } from '../../../../core/models/session.model';
import { FormSelectComponent } from '../../../../shared/xt-forms/components/form-select/form-select.component';
import { CustomToastService } from '../../../../core/services/helper/custom-toast.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DATE_FORMAT } from '../../../../core/models/constants';

@Component({
  selector: 'app-modify-user',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './modify-user.component.html',
  styleUrls: ['./modify-user.component.less'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT }
  ]
})
export class ModifyUserComponent extends ViewModifyComponent implements OnInit {
  breadcrumbs: BreadcrumbItemModel[] = [];

  // constants
  UserModel = UserModel;
  // PhoneNumberType = PhoneNumberType;

  // authenticated user
  authUser: UserModel;

  userId: string;
  user: UserModel = new UserModel();
  oldPassword: string;
  passwordConfirmModel: string;
  rolesList$: Observable<UserRoleModel[]>;
  countriesList$: Observable<RegionModel[]>;

  @ViewChild('countriesList') countryListControl: FormSelectComponent;
  // ask for old password
  askForOldPassword = false;

  /**
   * Constructor
   */
  constructor(
    protected route: ActivatedRoute,
    private userDataService: UserDataService,
    private userRoleDataService: UserRoleDataService,
    private authDataService: AuthManagementDataService,
    // private snackbarService: SnackbarService,
    private formHelper: FormHelperService,
    protected dialogService: DialogService,
    protected router: Router,
    private storageService: StorageService,
    private nutsDataService: NutsDataService,
    private customToastService: CustomToastService
  ) {
    super(
      route,
      dialogService
    );
  }

  /**
   * Component initialized
   */

  ngOnInit(): void {
    // get the authenticated user
    this.authUser = this.authDataService.getAuthenticatedUser();
    this.countriesList$ = this.nutsDataService.getRegions('0');
    // show loading
    this.showLoadingDialog(false);

    // get the route params
    this.route.params.subscribe((params: { userId }) => {
      // get the ID of the User being modified
      this.userId = params.userId;

      // retrieve user and system information
      forkJoin([
        // this.systemSettingsDataService.getAPIVersionNoCache(),
        this.userDataService.getUser(this.userId)
      ]).subscribe(([/* tokenInfo,*/ user]) => {
        // determine if we should ask for old password
        // this.askForOldPassword = !tokenInfo.skipOldPasswordForUserModify;
        this.askForOldPassword = false;
        // set user data
        this.user = user;

        if (this.user.settings?.data_interval) {
          if (this.user.settings.data_interval.start_date) {
            this.user.settings.data_interval.start_date =
              moment.utc(this.user.settings.data_interval.start_date).format(DateFormatISODate);
          }
          if (this.user.settings.data_interval.end_date) {
            this.user.settings.data_interval.end_date =
              moment.utc(this.user.settings.data_interval.end_date).format(DateFormatISODate);
          }
        }

        if (this.user.settings?.color_palette?.length === 0) {
          this.user.settings.color_palette = ['#7cb5ec', '#434348'];
        } else {
          if (this.user.settings?.color_palette?.includes('')) {
            this.user.settings.color_palette = ['#7cb5ec', '#434348'];
          }
        }

        // update breadcrumbs
        this.initializeBreadcrumbs();

        // hide loading
        this.hideLoadingDialog();
      });
    });

    // get the list of roles to populate the dropdown in UI
    const qb = new RequestQueryBuilder();
    qb.sort.by('name');
    this.rolesList$ = this.userRoleDataService.getRolesList(qb)
      .pipe(
        map((results) => {
          return results.map((result) => new UserRoleModel(result));
        }),
        // if user does not have role_all permission,
        // populate list only with the user's own role
        tap((data: any[]) => {
          if (!data?.length) {
            data = [new UserRoleModel(this.user.role)];
          }
          return data;
        })
      );
    // this.outbreaksList$ = this.outbreakDataService.getOutbreaksListReduced();
    // this.institutionsList$ =
    // this.referenceDataService.getReferenceDataByCategoryAsLabelValue(ReferenceDataCategory.INSTITUTION_NAME);
  }

  /**
   * Initialize breadcrumbs
   */
  initializeBreadcrumbs(): void {
    // reset
    this.breadcrumbs = [];

    // add list breadcrumb only if we have permission
    if (true /* UserModel.canList(this.authUser) */) {
      this.breadcrumbs.push(
        new BreadcrumbItemModel('Users', '/users')
      );
    }

    // view / modify breadcrumb
    this.breadcrumbs.push(
      new BreadcrumbItemModel(
        this.viewOnly ?
          'View' :
          'Modify',
        null,
        true,
        {},
        this.user
      )
    );
  }

  /**
   * Modify user
   */
  modifyUser(form: NgForm): void {
    // validate form
    if (!this.formHelper.validateForm(form)) {
      return;
    }

    // remove password if empty
    const dirtyFields: any = this.formHelper.getDirtyFields(form);
    if (_.isEmpty(dirtyFields.password)) {
      delete dirtyFields.passwordConfirmModel;
      delete dirtyFields.oldPassword;
    }

    // remove password confirm
    delete dirtyFields.passwordConfirm;

    if (form.valid && !_.isEmpty(dirtyFields)) {
      // show loading
      // this.showLoadingDialog();

      const start_date = form.value.data_start_date ? moment.utc(form.value.data_start_date).toISOString() : null;
      const end_date = form.value.data_end_date ? moment.utc(form.value.data_end_date).toISOString() : null;
      dirtyFields.settings = {
        data_interval: { start_date: start_date || null, end_date: end_date || null },
        color_palette: [form.value.color_palette1, form.value.color_palette2]
      };

      if (dirtyFields.data_start_date !== undefined || dirtyFields.data_end_date !== undefined) {
        delete dirtyFields.data_start_date;
        delete dirtyFields.data_end_date;
      }

      if (dirtyFields.color_palette1 || dirtyFields.color_palette2) {

        dirtyFields.settings.color_palette[0] = dirtyFields.color_palette1 ? dirtyFields.color_palette1 : form.value.color_palette1;
        dirtyFields.settings.color_palette[1] = dirtyFields.color_palette2 ? dirtyFields.color_palette2 : form.value.color_palette2;

        delete dirtyFields.color_palette1;
        delete dirtyFields.color_palette2;
      }

      // modify the user
      this.userDataService
        .modifyUser(this.userId, dirtyFields)
        .pipe(
          catchError((err) => {
            this.customToastService.showError(err.error.message);
            // hide loading
            this.hideLoadingDialog();
            return throwError(err);
          })
        )
        .subscribe((modifiedUser: UserModel) => {
          // update model
          this.user = modifiedUser;

          // cache auth data with new user information if the modified user is the logged one
          const currentCachedData: LocalSessionModel = this.storageService.get(StorageKey.AUTH_MANAGEMENT_DATA);
          if (currentCachedData.user.id === modifiedUser.id) {
            currentCachedData.user = modifiedUser;

            if (dirtyFields.location !== undefined) {
              currentCachedData.location = dirtyFields.location;
              currentCachedData.locationName = this.countryListControl.options
                .find((region: RegionModel) => region.code === currentCachedData.location).name;
            }
            this.storageService.set(StorageKey.AUTH_MANAGEMENT_DATA, currentCachedData);
          }

          this.oldPassword = undefined;

          // reset password confirm model
          this.passwordConfirmModel = undefined;
          // navigate to proper page
          this.disableDirtyConfirm();
          this.router.navigate(['/users']);

        });
    }
  }

  resetDate(form: NgForm): void {
    this.user.settings.data_interval.start_date = null;
    this.user.settings.data_interval.end_date = null;

    form.controls.data_start_date.markAsDirty();
    form.controls.data_end_date.markAsDirty();
  }
}
