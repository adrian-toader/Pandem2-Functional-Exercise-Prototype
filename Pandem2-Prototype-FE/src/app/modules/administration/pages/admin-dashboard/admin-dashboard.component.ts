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
import { AfterContentChecked, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { JobDetailModel, SourceDetailModel } from 'src/app/core/models/source-data.model';
import { ImportDataService } from '../../../../core/services/data/import.data.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, AfterContentChecked {

  @ViewChild('paginator1') paginator1: MatPaginator;
  @ViewChild('paginator2') paginator2: MatPaginator;

  importResultsColumns: string[] = ['start_date', 'end_date', 'status', 'data_type'];
  dataSourcesColumns: string[] = ['name', 'active', 'description', 'date'];

  searchSource = '';

  localJobs: JobDetailModel[] = [];
  localSources: SourceDetailModel[] = [];

  importResultsDataSource = new MatTableDataSource();
  sourcesDataSource = new MatTableDataSource();

  sourcesData = undefined;
  sourcesMetadataMap = {};

  cachedSourcesData = undefined;

  constructor(private importDataService: ImportDataService) {
  }

  ngOnInit(): void {
    this.retrieveData();
  }

  ngAfterContentChecked(): void {
    if (this.paginator2 !== undefined && !_.isEqual(this.cachedSourcesData, this.sourcesData)) {
      this.sourcesDataSource = new MatTableDataSource(this.sourcesData.map(item => {
        return {
          date: moment(this.sourcesMetadataMap[item.sourceIds[0]].date).format('MM.DD.YYYY, HH.mm'),
          name: item.tag,
          description: this.sourcesMetadataMap[item.sourceIds[0]].source_description,
          active: this.sourcesMetadataMap[item.sourceIds[0]].active ? 'Yes' : 'No'
        };
      }));
      this.sourcesDataSource.paginator = this.paginator2;
      if (this.cachedSourcesData === undefined) {
        this.cachedSourcesData = _.cloneDeep(this.sourcesData);
      }
    }
  }

  retrieveData(): void {
    const importResults = this.importDataService.getImportResults({
      limit: 5
    });
    const sources = this.importDataService.getDataSourceTags({});

    forkJoin([
      importResults,
      sources
    ]
    ).subscribe(results => {
      const importResultsData = results[0].data;
      this.sourcesData = results[1].data;
      results[1].metadata.sources.forEach((item) => this.sourcesMetadataMap[item.id] = item);

      this.importResultsDataSource = new MatTableDataSource(importResultsData.map(item => {
        return {
          start_date: moment(item.start_date).format('MM.DD.YYYY, HH.mm'),
          end_date: item.end_date ? moment(item.end_date).format('MM.DD.YYYY, HH.mm') : '',
          status: _.upperCase(item.status),
          data_type: _.upperCase(item.data_type)
        };
      }));

      this.sourcesDataSource = new MatTableDataSource(this.sourcesData.map(item => {
        return {
          date: moment(this.sourcesMetadataMap[item.sourceIds[0]].date).format('MM.DD.YYYY, HH.mm'),
          name: item.tag,
          description: this.sourcesMetadataMap[item.sourceIds[0]].source_description,
          active: this.sourcesMetadataMap[item.sourceIds[0]].active ? 'Yes' : 'No'
        };
      }));
    });
  }

  lookFor(value): void {
    this.searchSource = value;
    if (value.length >= 4) {
      const auxSources = this.localSources.filter((item) => item.tag.includes(value));
      const auxJobs = this.localJobs.filter((item) => item.source.includes(value));
      this.importResultsDataSource = new MatTableDataSource(auxJobs);
      this.importResultsDataSource.paginator = this.paginator1;
      this.sourcesDataSource = new MatTableDataSource(auxSources);
      this.sourcesDataSource.paginator = this.paginator2;
    } else if (value.length === 0) {
      this.retrieveData();
    }
  }

  resetFilter(): void {
    this.searchSource = '';
    this.retrieveData();
  }

  prepareJobData(data: JobDetailModel[]): void {
    const dict = [];
    for (const item of data) {
      const localFind = dict.find((value) => value.souce === item.source);
      if (!localFind) {
        dict.push({
          souce: item.source,
          item
        });
      } else {
        const time = localFind.item.lastImport;
        if (time < item.lastImport) {
          localFind.item = item;
        } else if (time === item.lastImport && localFind.item.lastTime <= item.lastTime) {
          localFind.item = item;
        }
      }
    }
    const localList = [];
    for (const item of dict) {
      localList.push(item.item);
    }
    this.localJobs = localList;
    this.importResultsDataSource = new MatTableDataSource(this.localJobs);
    this.importResultsDataSource.paginator = this.paginator1;
  }
}
