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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModel } from '../../models/user.model';
import { ModelHelperService } from '../helper/model-helper.service';
import { RequestQueryBuilder } from '../../helperClasses/request-query-builder';
import { IBasicCount } from '../../models/basic-count.interface';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private apiUrl = environment.gatewayEndpoint;

  constructor(
    private http: HttpClient,
    private modelHelper: ModelHelperService
  ) {
  }

  /**
   * Retrieve the list of Users
   */
  getUsersList(_queryBuilder: RequestQueryBuilder = new RequestQueryBuilder()): Observable<UserModel[]> {
    // include roles and permissions in response
    // const qb = new RequestQueryBuilder();
    // qb.include('roles', true);
    // qb.merge(queryBuilder);

    // const filter = qb.buildQuery();
    return this.modelHelper.mapObservableListToModel(
      this.http.get(`${this.apiUrl}users`)
        .pipe(
          map((response: { data: any[], metadata: any }) => {
            const data = response.data;
            const metadata = response.metadata;
            data.forEach((user) => {
              user.role = metadata.roles.find((role) => role._id === user.roleId);
            });

            return data;
          })
        ),
      UserModel
    );
  }

  /**
   * Return total number of users
   */
  getUsersCount(
    queryBuilder: RequestQueryBuilder = new RequestQueryBuilder()
  ): Observable<IBasicCount> {
    const whereFilter = queryBuilder.filter.generateCondition(true);
    return this.http.get(`${this.apiUrl}users/count?where=${whereFilter}`);
  }

  /**
   * Retrieve a User
   */
  getUser(
    userId: string,
    queryBuilder: RequestQueryBuilder = new RequestQueryBuilder()
  ): Observable<UserModel> {
    const qb = new RequestQueryBuilder();
    // include roles and permissions in response
    qb.include('roles', true);

    qb.merge(queryBuilder);

    const filter = qb.buildQuery();
    return this.modelHelper.mapObservableToModel(
      this.http.get(`${this.apiUrl}users/${userId}?filter=${filter}`)
        .pipe(
          map((response: { data: any, metadata: any }) => {
            const data = response.data;
            data.role = response.metadata.role;

            return data;
          })
        ),
      UserModel
    );
  }

  /**
   * Create a new User
   */
  createUser(user): Observable<any> {
    return this.http.post(`${this.apiUrl}users`, user);
  }

  /**
   * Modify an existing UserRole
   */
  modifyUser(userId: string, data: any): Observable<UserModel> {
    return this.modelHelper.mapObservableToModel(
      this.http.put(`${this.apiUrl}users/${userId}`, data),
      UserModel
    );
  }

  /**
   * Delete an existing User
   */
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}users/${userId}`);
  }

}

