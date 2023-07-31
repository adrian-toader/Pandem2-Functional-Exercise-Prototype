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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { BreadcrumbItemModel } from '../../../../shared/components/breadcrumbs/breadcrumb-item.model';
import { UserModel } from '../../../../core/models/user.model';
import { UserDataService } from '../../../../core/services/data/user.data.service';
import { AuthManagementDataService } from '../../../../core/services/auth-management-data.service';
import { DialogAnswerButton, HoverRowAction, HoverRowActionType } from '../../../../shared/components';
import { DialogService } from '../../../../core/services/helper/dialog.service';
import { ListComponent } from '../../../../core/helperClasses/list-component';
import { DialogAnswer } from '../../../../shared/components/dialog/dialog.component';
import * as _ from 'lodash';
import { catchError, share, tap } from 'rxjs/operators';
import { IBasicCount } from '../../../../core/models/basic-count.interface';
import { ListHelperService } from '../../../../core/services/helper/list-helper.service';
import { VisibleColumnModel } from '../../../../shared/components/side-columns/model';
import { NutsDataService } from '../../../../core/services/data/nuts.data.service';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less']
})
export class UserListComponent extends ListComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItemModel[] = [
    new BreadcrumbItemModel('Users', '.', true)
  ];

  // authenticated user
  authUser: UserModel;

  // constants
  UserModel = UserModel;
  // PhoneNumberType = PhoneNumberType;
  // UserSettings = UserSettings;

  // list of existing users
  usersList$: Observable<UserModel[]>;
  usersListCount$: Observable<IBasicCount>;

  countriesList;
  recordActions: HoverRowAction[] = [
    // View User
    new HoverRowAction({
      icon: 'visibility',
      iconTooltip: 'View User',
      linkGenerator: (item: UserModel): string[] => {
        return ['/users', item.id, 'view'];
      },
      visible: (_item: UserModel): boolean => {
        return UserModel.canView(this.authUser); // item.id !== this.authUser.id &&
      }
    }),

    // Modify User
    new HoverRowAction({
      icon: 'settings',
      iconTooltip: 'Modify User',
      linkGenerator: (item: UserModel): string[] => {
        return ['/users', item.id, 'modify'];
      },
      visible: (_item: UserModel): boolean => {
        return UserModel.canModify(this.authUser); // item.id !== this.authUser.id &&
      }
    }),

    // Other actions
    new HoverRowAction({
      type: HoverRowActionType.MENU,
      icon: 'moreVertical',
      menuOptions: [
        // Delete User
        new HoverRowAction({
          menuOptionLabel: 'Delete User',
          click: (item: UserModel) => {
            this.deleteUser(item);
          },
          visible: (item: UserModel): boolean => {
            return item.id !== this.authUser.id &&
              UserModel.canDelete(this.authUser);
          },
          class: 'mat-menu-item-delete'
        })
      ]
    })
  ];

  /**
   * Constructor
   */
  constructor(
    protected listHelperService: ListHelperService,
    private userDataService: UserDataService,
    private authDataService: AuthManagementDataService,
    // private snackbarService: SnackbarService,
    private dialogService: DialogService,
    private nutsDataService: NutsDataService
  ) {
    super(listHelperService);
  }

  /**
   * Component initialized
   */
  ngOnInit(): void {
    // get the authenticated user
    this.authUser = this.authDataService.getAuthenticatedUser();
    this.nutsDataService.getRegions('0').subscribe((data) => {
      this.countriesList = data;
    });
    // initialize pagination
    this.initPaginator();

    // ...and load the list of items
    this.needsRefreshList(true);

    // initialize Side Table Columns
    this.initializeSideTableColumns();

  }

  /**
   * Release resources
   */
  ngOnDestroy(): void {
    // release parent resources
    super.ngOnDestroy();
  }

  /**
   * Initialize Side Table Columns
   */
  initializeSideTableColumns(): void {
    // default table columns
    this.tableColumns = [
      new VisibleColumnModel({
        field: 'lastName',
        label: 'Last Name'
      }),
      new VisibleColumnModel({
        field: 'firstName',
        label: 'First Name'
      }),
      new VisibleColumnModel({
        field: 'email',
        label: 'email'
      }),
      new VisibleColumnModel({
        field: 'location',
        label: 'location'
      }),
      new VisibleColumnModel({
        field: 'role',
        label: 'role'
      })
    ];
  }

  /**
   * Re(load) the Users list
   */
  refreshList(finishCallback: (records: any[]) => void): void {
    // get the list of existing users
    this.usersList$ = this.userDataService
      .getUsersList(this.queryBuilder)
      .pipe(
        catchError((err) => {
          // this.snackbarService.showApiError(err);
          finishCallback([]);
          return throwError(err);
        }),
        tap(this.checkEmptyList.bind(this)),
        tap((data: any[]) => {
          finishCallback(data);
        })
      );

  }

  /**
   * Get total number of items, based on the applied filters
   */
  refreshListCount(): void {
    // remove paginator from query builder
    const countQueryBuilder = _.cloneDeep(this.queryBuilder);
    countQueryBuilder.paginator.clear();
    countQueryBuilder.sort.clear();
    this.usersListCount$ = this.userDataService
      .getUsersCount(countQueryBuilder)
      .pipe(
        catchError((err) => {
          // this.snackbarService.showApiError(err);
          return throwError(err);
        }),
        share()
      );
  }

  deleteUser(user: UserModel): void {
    // show confirm dialog to confirm the action
    this.dialogService.showConfirm('Are you sure you want to delete this user: \'' + user.firstName + ' ' + user.lastName + '\'')
      .subscribe((answer: DialogAnswer) => {
        if (answer.button === DialogAnswerButton.Yes) {
          // delete the user
          this.userDataService
            .deleteUser(user.id)
            .pipe(
              catchError((err) => {
                // this.snackbarService.showApiError(err);
                return throwError(err);
              })
            )
            .subscribe(() => {
              // this.snackbarService.showSuccess('LNG_PAGE_LIST_USERS_ACTION_DELETE_USER_SUCCESS_MESSAGE');
              // reload data
              this.needsRefreshList(true);
            });
        }
      });
  }

  getCountryName(countryCode: string): void {
    return this.countriesList.find(x => x.code === countryCode).name;
  }
}
