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
import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
// @ts-ignore
import Highcharts from 'highcharts';
import HC_xrange from 'highcharts/modules/xrange';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Indicator, ExplorationComponent } from '../../../exploration/pages/exploration/exploration.component';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';
import { InterventionDataService } from 'src/app/core/services/data/intervention.data.service';
import { ImportDataService } from 'src/app/core/services/data/import.data.service';
import { DashboardComponent } from 'src/app/core/helperClasses/dashboard-component';
import { InterventionDataEntity } from 'src/app/core/entities/intervention-data.entity';
import { SelectedRegionService } from 'src/app/core/services/helper/selected-region.service';
import { CustomDateIntervalService } from 'src/app/core/services/helper/custom-date-interval.service';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';
import { DateFormatISODate } from '../../../../shared/constants';
import * as moment from 'moment/moment';

HC_xrange(Highcharts);

@Component({
  selector: 'app-intervention-filter-card',
  templateUrl: './intervention-filter-card.component.html',
  styleUrls: ['./intervention-filter-card.component.less']
})

export class InterventionFilterCardComponent extends DashboardComponent implements OnInit {
  @Input() set intervalStartDate(startDate) {
    if (startDate && startDate !== this.startDate) {
      this.startDate = moment(startDate, Constants.DEFAULT_DATE_DISPLAY_FORMAT).format(DateFormatISODate);
    }
  }

  @Input() set intervalEndDate(endDate) {
    if (endDate && endDate !== this.endDate) {
      this.endDate = moment(endDate, Constants.DEFAULT_DATE_DISPLAY_FORMAT).format(DateFormatISODate);
    }
  }

  @Output() interventionsOutput = new EventEmitter<InterventionDataEntity[]>();
  chartInstance;
  Highcharts: typeof Highcharts = Highcharts;
  updateChart: boolean = false;
  xchart: Highcharts.Options =
    {
      chart: {
        type: 'xrange'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Interventions'
      },
      xAxis: {
        type: 'datetime',
        labels: {
          formatter: function() {
            return moment(this.value).format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
          }
        }
      },
      yAxis: {},
      series: [],
      tooltip: {
        shared: false,
        useHTML: true,
        headerFormat: '',
        pointFormat: '<div style="color: blue; text-align: center;">{point.name}</div>'
          + '<div style="font-weight: bold; text-align: center;">{point.startDate} - {point.endDate}</div>'
          + '<div style="border-bottom: 1px solid;"></div>'
          + '<div>{point.desc}</div>'
      }
    };

  interventions: InterventionDataEntity[] = [];
  editableInterventions: InterventionDataEntity[] = [];
  sources = [];
  sourcesMetadataMap = {};

  indicators: Indicator[];
  yAxis = {};
  xAxis = {};
  allRegions = [];
  toggleArray = [1, 0, 0, 0];
  nutsLevel = 0;
  formControl = new UntypedFormControl();
  countryList = [];
  selectedFilter = 'country';
  selectedCountry;
  selectedCountries = [];
  selectedIndicators = [];
  selectedInterventions = [];
  selectedSources = [];
  countryControl = new UntypedFormControl();
  indicatorControl = new UntypedFormControl();
  interventionControl = new UntypedFormControl();
  sourceControl = new UntypedFormControl();

  dataInterval = '7days';
  plotType: LinearLog = Constants.linear;
  isLog = false;
  dataType = 'Absolute';
  displayTotalType = true;

  // Constants
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  customSource = { tag: 'Custom', sourceIds: [] };

  constructor(
    protected nutsData: NutsDataService,
    protected cdr: ChangeDetectorRef,
    protected interventionDataService: InterventionDataService,
    protected importDataService: ImportDataService,
    protected selectedRegion: SelectedRegionService,
    protected customDateInterval: CustomDateIntervalService,
    protected storageService: StorageService
  ) {
    super(selectedRegion, customDateInterval, storageService);
  }

  ngOnInit(): void {
    this.nutsData.getRegions(this.nutsLevel.toString())
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.countryList = _.orderBy(data, ['name'], ['asc']);
        this.allRegions = _.orderBy(data, ['name'], ['asc']);
      });
    this.importDataService.getDataSourceTags({})
      .pipe(takeUntil(this.destroyed$))
      .subscribe((sourcesData) => {
        sourcesData.metadata.sources.forEach((item) => this.sourcesMetadataMap[item.id] = item);
        this.sources = _.orderBy(sourcesData.data, ['tag'], ['asc']);
        this.sources.push(this.customSource);
        this.selectedSources = [this.customSource].slice();
        this.sourceControl.setValue(this.selectedSources);
      });
    this.indicators = ExplorationComponent.Indicators;
    this.indicatorControl.setValue([]);
    this.interventionControl.setValue([]);
    this.countryList.forEach(x => x.children = []);
    this.xchart.yAxis = {
      title: {
        text: ''
      },
      categories: ['Intervention'],
      reversed: true
    };

    if (this.startDate) {
      this.xchart.xAxis.min = moment(this.startDate).valueOf();
    }

    if (this.endDate) {
      this.xchart.xAxis.max = moment(this.endDate).valueOf();
    }

    this.xAxis = {
      type: 'datetime'
    };

    delete this.xchart.series;
    this.xchart.series = [];
    this.xchart.series.push({
      name: 'Interventions',
      pointWidth: 20,
      type: 'xrange',
      dataLabels: {
        enabled: true
      }
    });
  }

  switchInterval(value): void {
    this.dataInterval = value.value;
  }

  switchPlotType(value): void {
    this.plotType = value.value;
    this.isLog = this.plotType !== Constants.linear;
  }

  switchDataType(value): void {
    this.dataType = value.value;
  }

  sendInterventionsToParent(interventions) {
    this.interventionsOutput.emit(interventions);
  }

  switchToggle(array, nuts): void {
    this.toggleArray = array;
    this.nutsLevel = nuts;
    this.countryControl.setValue([]);
    this.selectedCountry = undefined;
    this.nutsData.getRegions(this.nutsLevel.toString())
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.allRegions = _.orderBy(data, ['name'], ['asc']);
        if (this.nutsLevel !== 0) {
          for (const item of this.countryList) {
            const localFind = this.allRegions.filter(x => x.code.includes(item.code));
            item.children = _.orderBy(localFind, ['name'], ['asc']);
          }
        }
      });
  }

  repopulateInterventionList(): void {
    this.interventions = [];
    if (this.selectedCountry && this.selectedSources) {
      this.interventionDataService.getInterventionList(this.selectedCountry.code, this.selectedSources)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((data) => {
          this.interventions = _.orderBy(data, ['name'], ['asc']);
          this.repopulateInterventionGraph();
        });
    }
  }

  changed(): void {
    if (this.countryControl.value) {
      this.selectedCountry = this.countryControl.value;
      this.selectedCountries = [this.selectedCountry];
      this.repopulateInterventionList();
      this.resendEditableInterventions();

      this.resetCharts();
    }
  }

  resendEditableInterventions(): void {
    const sources = [this.customSource];
    this.interventionDataService.getInterventionList(this.selectedCountry.code, sources)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.editableInterventions = _.orderBy(data, ['name'], ['asc']);
        this.sendInterventionsToParent(this.editableInterventions);
      });
  }

  onChartInstance(event): void {
    this.chartInstance = event;
  }

  repopulateInterventionGraph(): void {
    this.showLoading();
    const categories: any = [];
    const seriesData: any = [];
    this.selectedInterventions.forEach(element => {
      categories.push(element.name);
      seriesData.push({
        'x': (new Date(element.start_date)).getTime(),
        'x2': (new Date(element.end_date)).getTime(),
        'y': categories.length - 1,
        'desc': element.description,
        'name': element.name,
        'startDate': (new Date(element.start_date)).toDateString(),
        'endDate': (new Date(element.end_date)).toDateString()
      });
    });
    this.xchart.yAxis = {
      title: {
        text: ''
      },
      categories: categories,
      reversed: true
    };
    this.xAxis = {
      type: 'datetime'
    };

    delete this.xchart.series;
    this.xchart.series = [];
    this.xchart.series.push({
      name: 'Interventions - ' + this.selectedCountry.code,
      borderColor: 'gray',
      pointWidth: 20,
      type: 'xrange',
      data: seriesData,
      dataLabels: {
        enabled: true
      }
    });
    if (seriesData.length) {
      this.xchart.chart.height = seriesData.length * 60 + 120;
    }
    this.updateChart = true;
    this.forceUpdate();
    this.hideLoading();
  }

  forceUpdate(): void {
    this.refreshChart(this.chartInstance);
  }

  // TODO reset charts as currently is not working
  resetCharts(): void {
    // interventions chart
    this.xchart.series = [];
    this.xchart.series.push({
      name: 'Interventions',
      pointWidth: 20,
      type: 'xrange',
      dataLabels: {
        enabled: true
      }
    });
    delete this.xchart.chart.height;
    this.updateChart = true;
    this.forceUpdate();
  }

  refreshChart(chart): void {
    setTimeout(() => {
      if (chart && Object.keys(chart).length !== 0) {
        chart.reflow();
      }
    }, 0);
  }

  changedIndicator(): void {
    this.selectedIndicators = this.indicatorControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedIndicators = this.selectedIndicators.slice();

    this.displayTotalType = !this.selectedIndicators.some(i => i.hasTotalType === false);
  }

  removeIndicator(indicator): void {
    const index = this.indicatorControl.value.indexOf(indicator);
    const auxList = this.indicatorControl.value;
    if (index >= 0) {
      auxList.splice(index, 1);
    }
    this.indicatorControl.setValue(auxList);
    this.selectedIndicators = this.indicatorControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedIndicators = this.selectedIndicators.slice();

    this.displayTotalType = !this.selectedIndicators.some(i => i.hasTotalType === false);
  }

  changedIntervention(): void {
    this.selectedInterventions = this.interventionControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedInterventions = this.selectedInterventions.slice();
    this.repopulateInterventionGraph();
  }

  removeIntervention(intervention): void {
    const index = this.interventionControl.value.indexOf(intervention);
    const auxList = this.interventionControl.value;
    if (index >= 0) {
      auxList.splice(index, 1);
    }
    this.interventionControl.setValue(auxList);
    this.selectedInterventions = this.interventionControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedInterventions = this.selectedInterventions.slice();
    this.repopulateInterventionGraph();
  }

  changedSource(): void {
    this.selectedSources = this.sourceControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedSources = this.selectedSources.slice();
    this.repopulateInterventionList();

    this.resetCharts();
  }

  removeSource(source): void {
    const index = this.sourceControl.value.findIndex((item) => _.isEqual(item.tag, source.tag));
    const auxList = this.sourceControl.value;
    if (index >= 0) {
      auxList.splice(index, 1);
    }
    this.sourceControl.setValue(auxList);
    this.selectedSources = this.sourceControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another
    // list to trigger the change detector
    this.selectedSources = this.selectedSources.slice();
    this.repopulateInterventionList();

    this.resetCharts();
  }
}
