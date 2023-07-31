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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiQueryBuilder, ApiQueryBuilderSort, ApiQueryBuilderSortMethod } from '../../helperClasses/api-query-builder';
import { ListPagePaginator } from '../../helperClasses/list/list-page-paginator';
import { ModellingModel, ModellingScenario, ModellingScenarioWithDayResults, SimulatedModel } from '../../models/modelling-data.model';
import { ModelHelperService } from '../helper/model-helper.service';
import { map } from 'rxjs/operators';
import { IModellingScenarioWithDayResultsDataEntityPayload, IModellingScenarioDataEntityPayload, IModellingScenarioProcessedDayResult } from '../../entities/modelling-data.entity';

@Injectable({
  providedIn: 'root'
})
export class ModellingDataService {
  private apiUrl = environment.gatewayEndpoint;
  private servicePath = `${this.apiUrl}modelling`;

  constructor(
    private http: HttpClient,
    private modelHelperService: ModelHelperService
  ) {}

  getModellingParameters(): Observable<object> {
    return this.http.get(this.servicePath + '/parameters');
  }

  simulateModel(modelData): Observable<SimulatedModel[]> {
    return this.modelHelperService.mapObservableListToModel(
      this.http.post(this.servicePath + '/simulate', modelData),
      SimulatedModel
    );
  }

  getModelList(): Observable<ModellingModel[]> {
    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${this.servicePath}/models`),
      ModellingModel
    );
  }

  createModel(model: ModellingModel): Observable<any> {
    return this.http.post(`${this.servicePath}/models`, model);
  }

  deleteModel(modelId: string): Observable<any> {
    return this.http.delete(`${this.servicePath}/models/${modelId}`);
  }

  getScenarioList(userId: string, showNotVisible?: boolean): Observable<ModellingScenario[]> {
    // If requested, show not visible scenarios too
    // Sending an empty filter will make the API return all of the user's scenarios
    let requestParams: any = {};
    if (showNotVisible) {
      requestParams = {
        filter: JSON.stringify({})
      };
    }

    return this.modelHelperService.mapObservableListToModel(
      this.http.get(`${this.servicePath}/scenarios/user/${userId}`, { params: requestParams }),
      ModellingScenario
    );
  }

  getLastScenario(userId: string): Observable<ModellingScenario> {
    const qb = new ApiQueryBuilder();

    qb.sortBy(new ApiQueryBuilderSort('date', ApiQueryBuilderSortMethod.DESC));
    const paginator: ListPagePaginator = new ListPagePaginator();
    paginator.numberOfRecordsPerPage = 1;
    qb.paginator = paginator;

    const url = qb.attachToUrl(`${this.servicePath}/scenarios/user/${userId}`);

    return this.modelHelperService.mapObservableToModel(
      this.http.get(url).pipe(
        map(scenarios => {
          return scenarios ? scenarios[0] : undefined;
        })
      ),
      ModellingScenario
    );
  }

  getScenarioById(scenarioId: string): Observable<ModellingScenarioWithDayResults> {
    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${this.servicePath}/scenarios/${scenarioId}`),
      ModellingScenarioWithDayResults
    );
  }

  getScenarioDetails(scenarioId: string): Observable<ModellingScenario> {
    return this.modelHelperService.mapObservableToModel(
      this.http.get(`${this.servicePath}/scenario-details/${scenarioId}`),
      ModellingScenario
    );
  }

  createScenario(scenario: IModellingScenarioDataEntityPayload): Observable<ModellingScenarioWithDayResults> {
    return this.modelHelperService.mapObservableToModel(
      this.http.post(`${this.servicePath}/scenarios`, scenario),
      ModellingScenarioWithDayResults
    );
  }

  saveScenario(scenario: IModellingScenarioWithDayResultsDataEntityPayload): Observable<ModellingScenario> {
    // Process & compress results
    const scenarioResults: IModellingScenarioProcessedDayResult = {};
    Object.keys(scenario.day_results[0]).forEach(key => {
      if (key !== '_id' && key !== 'scenarioId' && key !== 'day') {
        scenarioResults[key] = [];
      }
    });
    scenario.day_results.forEach(day => {
      Object.keys(day).forEach(key => {
        if (key !== '_id' && key !== 'scenarioId' && key !== 'day') {
          scenarioResults[key].push(day[key]);
        }
      });
    });

    // Save compressed & processed results
    scenario.day_results = undefined;
    scenario.processed_results = scenarioResults;

    return this.modelHelperService.mapObservableToModel(
      this.http.post(`${this.servicePath}/save-scenarios`, scenario),
      ModellingScenario
    );
  }

  deleteScenario(scenarioId: string): Observable<any> {
    return this.http.delete(`${this.servicePath}/scenarios/${scenarioId}`);
  }

  updateScenario(scenarioId: string, payload: IModellingScenarioDataEntityPayload): Observable<ModellingScenario> {
    return this.modelHelperService.mapObservableToModel(
      this.http.put(`${this.servicePath}/scenarios/${scenarioId}`, payload),
      ModellingScenario
    );
  }
}
