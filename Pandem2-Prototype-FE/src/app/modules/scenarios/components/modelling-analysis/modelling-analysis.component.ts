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
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModellingScenarioDayResults, ModellingScenarioDayResultsDataMap } from 'src/app/core/entities/modelling-data.entity';
import { ModellingScenarioComponent } from 'src/app/core/helperClasses/modelling-scenario-component';
import { GraphDatasource } from 'src/app/core/helperClasses/split-data';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';

interface IHeatmap {
  name: string;
  data: any[];
}

@Component({
  selector: 'app-modelling-analysis',
  templateUrl: './modelling-analysis.component.html',
  styleUrls: ['./modelling-analysis.component.less']
})
export class ModellingAnalysisComponent extends ModellingScenarioComponent implements OnInit {
  chartSelection = {
    ResourceHeatmap: 'resourceheatmap',
    PatientSankey: 'patientsankey',
    ICULineChart: 'iculinechart',
    ICUNursesBarChart: 'icunursesbarchart',
    PeakVSAvailableResources: 'peakvsavailableresources'
  };

  selectedChart = this.chartSelection.ResourceHeatmap;
  sliderDay = 90;

  // Heatmap
  resourceHeatmap: IHeatmap[] = [];
  resourceHeatmapYAxis: [] = [];

  compResourceHeatmap: IHeatmap[] = [];
  compResourceHeatmapYAxis: [] = [];

  // Patient sankey
  patientSankey = [];
  compPatientSankey = [];

  // ICU Line chart
  ICULineChart = [];
  compICULineChart = [];

  // ICU Nurses chart
  ICUNursesChart = [];
  ICUNursesChartPlotlines = {};
  compICUNursesChart = [];
  compICUNursesChartPlotlines = {};

  // Peak vs Available Radar
  radarChartSeries = [];
  compRadarChartSeries = [];
  radarChartXAxis = [];

  // Heatmap data
  resourceHeatmapColors = {
    stops: [
      [0, '#000000'],
      [0.02, '#940523'],
      [0.05, '#ef2025'],
      [0.15, '#ff7647'],
      [0.25, '#ffd587'],
      [0.35, '#fefab3'],
      [0.5, '#ffffff'],
      [0.65, '#c0d8f0'],
      [0.75, '#8fbae4'],
      [0.85, '#5c9bd9'],
      [0.95, '#3979b8'],
      [1, '#265382']
    ],
    minColor: '#000000',
    maxColor: '#265382'
  };

  heatmapTooltip = {
    formatter() {
      if (this.point) {
        const X = this.point.x;
        const Y = this.point.y;
        if (this.series.yAxis.categories[Y]) {
          return this.series.yAxis.categories[Y] ? `&nbsp;${this.series.xAxis.categories[X]} <br>
          ${this.series.yAxis.categories[Y]} <br>
          <strong>Total: </strong><b> ${this.point.value}% </b>` : `<span style = "font-size:10px">${this.point.category}</span><br/>${this.series.name}: ${this.point.y}`;
        }
      }
    }
  };

  // Sankey data
  sankeyTooltip = {
    formatter() {
      if (this.point) {
        const name = 'Patient Sankey';
        if (this.point.isNode) {
          const node = this.point.name;
          const weight = this.point.sum;
          return `${name}<br>${node}: <strong>${weight}</strong>`;
        }
        else{
          const from = this.point.from;
          const to = this.point.to;
          const weight = this.point.weight;
          return `${name}<br>${from} &#8594 ${to}: <strong>${weight}</strong>`;
        }
      }
    }
  };

  // ICU Nurses data
  ICUNursesPlotOptions = {
    column: {
      grouping: false
    }
  };

  // Radar data
  radarChart = {
    polar: true
  };
  radarChartYAxis = {
    gridLineInterpolation: 'polygon',
    min: 0
  };
  radarTooltip = {
    headerFormat: '<span style = "font-size:10px">{point.key}</span><table>',
    pointFormat: '<tr><td style = "color:{series.color};padding:0">{series.name}: </td>' +
      '<td style = "padding:0"><b>{point.y}%</b></td></tr>', footerFormat: '</table>', shared: true, useHTML: true
  };

  constructor(
    protected dialog: MatDialog,
    protected modellingDataService: ModellingDataService
  ) {
    super(dialog, modellingDataService);
  }

  ngOnInit(): void {
    // If scenarioId is given, component gets it's own data and overwrites everything else
    if (this.scenarioId) {
      // Method from parent will also set rawData & everything that is needed
      this.retrieveScenarioData(this.scenarioId).then(() => {
        this.createXAxis();
        this.loadData();
      });
    }
    // Else, rawData & everything else is expected to be already given as inputs
    else {
      this.loadData();
    }
  }

  loadData() {
    switch (this.selectedChart) {
      case this.chartSelection.ResourceHeatmap: {
        this.loadDataHeatmap();
        break;
      }
      case this.chartSelection.PatientSankey: {
        this.loadDataSankey();
        break;
      }
      case this.chartSelection.ICULineChart: {
        this.loadDataICUChart();
        break;
      }
      case this.chartSelection.ICUNursesBarChart: {
        this.loadDataICUNurses();
        break;
      }
      case this.chartSelection.PeakVSAvailableResources: {
        this.loadDataRadar();
        break;
      }
    }
  }

  loadDataHeatmap() {
    const dataArray = [
      ModellingScenarioDayResults.PandemicPPEStock,
      ModellingScenarioDayResults.StaffedEquippedICUBedsAvailable,
      ModellingScenarioDayResults.VentilatorsAvailable,
      ModellingScenarioDayResults.AvailableICUNurses,
      ModellingScenarioDayResults.PhysicalICUBedsAvailable,
      ModellingScenarioDayResults.StaffedWardBedsAvailable,
      ModellingScenarioDayResults.AvailableNurses,
      ModellingScenarioDayResults.PhysicalWardBedsAvailable
    ];

    if (this.data.size) {
      this.resourceHeatmap = [];
      this.resourceHeatmapYAxis = [];
      dataArray.forEach(key => {
        this.loadHeatmapData(this.resourceHeatmap, this.resourceHeatmapYAxis, this.data, key);
      });
    }

    if (this.comparisonData.size) {
      this.compResourceHeatmap = [];
      this.compResourceHeatmapYAxis = [];
      dataArray.forEach(key => {
        this.loadHeatmapData(this.compResourceHeatmap, this.compResourceHeatmapYAxis, this.comparisonData, key);
      });
    }
  }

  loadHeatmapData(array: IHeatmap[], yAxis: string[], map: Map<string, GraphDatasource>, key: string) {
    const name = ModellingScenarioDayResultsDataMap.get(key).label;
    let mapElem = map.get(key).total.yAxis[0].data;
    const mapElemMax = Math.max(...mapElem);

    // Calculate percentage available
    mapElem = mapElem.map(e => (Math.round((e * 100 / mapElemMax) * 100) / 100) > 0
      ? (Math.round((e * 100 / mapElemMax) * 100) / 100)
      : 0);

    yAxis.push(name);
    const yIndex = yAxis.indexOf(name);

    mapElem = mapElem.map((e, index) => [index, yIndex, e]);

    // Create data array
    array.push({ name: name, data: mapElem });
  }

  loadDataSankey() {
    const dataArray = [
      {
        from: 'Hospital Admissions', to: 'Hospital Occupancy',
        keys: [
          ModellingScenarioDayResults.HospitalAdmissionsA,
          ModellingScenarioDayResults.HospitalAdmissionsB,
          ModellingScenarioDayResults.HospitalAdmissionsC,
          ModellingScenarioDayResults.HospitalAdmissionsD
        ]
      },
      {
        from: 'Hospital Occupancy', to: 'Ward Admissions',
        keys: [
          ModellingScenarioDayResults.WardAdmissionsA,
          ModellingScenarioDayResults.WardAdmissionsB,
          ModellingScenarioDayResults.WardAdmissionsC,
          ModellingScenarioDayResults.WardAdmissionsD
        ]
      },
      {
        from: 'Ward Admissions', to: 'Ward',
        keys: [
          ModellingScenarioDayResults.WardAdmissionsA,
          ModellingScenarioDayResults.WardAdmissionsB,
          ModellingScenarioDayResults.WardAdmissionsC,
          ModellingScenarioDayResults.WardAdmissionsD
        ]
      },
      {
        from: 'Ward', to: 'Ward Discharges',
        keys: [
          ModellingScenarioDayResults.HospitalDischargesA,
          ModellingScenarioDayResults.HospitalDischargesB,
          ModellingScenarioDayResults.HospitalDischargesC,
          ModellingScenarioDayResults.HospitalDischargesD
        ]
      },
      {
        from: 'Ward Discharges', to: 'Discharges',
        keys: [
          ModellingScenarioDayResults.HospitalDischargesA,
          ModellingScenarioDayResults.HospitalDischargesB,
          ModellingScenarioDayResults.HospitalDischargesC,
          ModellingScenarioDayResults.HospitalDischargesD
        ]
      },
      {
        from: 'Hospital Occupancy', to: 'ICU Admissions',
        keys: [
          ModellingScenarioDayResults.ICUAdmissionsA,
          ModellingScenarioDayResults.ICUAdmissionsB,
          ModellingScenarioDayResults.ICUAdmissionsC,
          ModellingScenarioDayResults.ICUAdmissionsD
        ]
      },
      {
        from: 'ICU Admissions', to: 'ICU',
        keys: [
          ModellingScenarioDayResults.ICUAdmissionsA,
          ModellingScenarioDayResults.ICUAdmissionsB,
          ModellingScenarioDayResults.ICUAdmissionsC,
          ModellingScenarioDayResults.ICUAdmissionsD
        ]
      },
      {
        from: 'ICU', to: 'ICU Discharges',
        keys: [
          ModellingScenarioDayResults.ICUDischargesA,
          ModellingScenarioDayResults.ICUDischargesB,
          ModellingScenarioDayResults.ICUDischargesC,
          ModellingScenarioDayResults.ICUDischargesD
        ]
      },
      {
        from: 'ICU Discharges', to: 'Discharges',
        keys: [
          ModellingScenarioDayResults.ICUDischargesA,
          ModellingScenarioDayResults.ICUDischargesB,
          ModellingScenarioDayResults.ICUDischargesC,
          ModellingScenarioDayResults.ICUDischargesD
        ]
      },
      {
        from: 'Hospital Occupancy', to: 'Ward Overflow',
        keys: [
          ModellingScenarioDayResults.InWardOverflowA,
          ModellingScenarioDayResults.InWardOverflowB,
          ModellingScenarioDayResults.InWardOverflowC,
          ModellingScenarioDayResults.InWardOverflowD
        ]
      },
      {
        from: 'Ward Overflow', to: 'Overflow',
        keys: [
          ModellingScenarioDayResults.InWardOverflowA,
          ModellingScenarioDayResults.InWardOverflowB,
          ModellingScenarioDayResults.InWardOverflowC,
          ModellingScenarioDayResults.InWardOverflowD
        ]
      },
      {
        from: 'Hospital Occupancy', to: 'ICU Overflow',
        keys: [
          ModellingScenarioDayResults.InICUOverflowA,
          ModellingScenarioDayResults.InICUOverflowB,
          ModellingScenarioDayResults.InICUOverflowC,
          ModellingScenarioDayResults.InICUOverflowD
        ]
      },
      {
        from: 'ICU Overflow', to: 'Overflow',
        keys: [
          ModellingScenarioDayResults.InICUOverflowA,
          ModellingScenarioDayResults.InICUOverflowB,
          ModellingScenarioDayResults.InICUOverflowC,
          ModellingScenarioDayResults.InICUOverflowD
        ]
      },
      {
        from: 'Hospital Occupancy', to: 'Patients Waiting for Ward Bed',
        keys: [
          ModellingScenarioDayResults.PatientsWaitingForWardBedA,
          ModellingScenarioDayResults.PatientsWaitingForWardBedB,
          ModellingScenarioDayResults.PatientsWaitingForWardBedC,
          ModellingScenarioDayResults.PatientsWaitingForWardBedD
        ]
      },
      {
        from: 'Patients Waiting for Ward Bed', to: 'Patients Waiting for Beds',
        keys: [
          ModellingScenarioDayResults.PatientsWaitingForWardBedA,
          ModellingScenarioDayResults.PatientsWaitingForWardBedB,
          ModellingScenarioDayResults.PatientsWaitingForWardBedC,
          ModellingScenarioDayResults.PatientsWaitingForWardBedD
        ]
      },
      {
        from: 'Hospital Occupancy', to: 'Patients Waiting for ICU Bed',
        keys: [
          ModellingScenarioDayResults.PatientsWaitingForICUA,
          ModellingScenarioDayResults.PatientsWaitingForICUB,
          ModellingScenarioDayResults.PatientsWaitingForICUC,
          ModellingScenarioDayResults.PatientsWaitingForICUD
        ]
      },
      {
        from: 'Patients Waiting for ICU Bed', to: 'Patients Waiting for Beds',
        keys: [
          ModellingScenarioDayResults.PatientsWaitingForICUA,
          ModellingScenarioDayResults.PatientsWaitingForICUB,
          ModellingScenarioDayResults.PatientsWaitingForICUC,
          ModellingScenarioDayResults.PatientsWaitingForICUD
        ]
      },
      {
        from: 'Hospital Occupancy', to: 'Deaths in Hospital',
        keys: [
          ModellingScenarioDayResults.DeathsInHospitalA,
          ModellingScenarioDayResults.DeathsInHospitalB,
          ModellingScenarioDayResults.DeathsInHospitalC,
          ModellingScenarioDayResults.DeathsInHospitalD
        ]
      }
    ];

    if (this.data.size) {
      const sankeyObj = {
        name: 'Patient Sankey',
        keys: ['from', 'to', 'weight'],
        data: []
      };

      dataArray.forEach(elem => {
        this.loadSankeyData(this.data, sankeyObj, elem.from, elem.to, elem.keys);
      });

      this.patientSankey[0] = sankeyObj;
      this.patientSankey = [...this.patientSankey];
    }

    if (this.comparisonData.size) {
      const sankeyObj = {
        name: 'Patient Sankey',
        keys: ['from', 'to', 'weight'],
        data: []
      };

      dataArray.forEach(elem => {
        this.loadSankeyData(this.comparisonData, sankeyObj, elem.from, elem.to, elem.keys);
      });

      this.compPatientSankey[0] = sankeyObj;
      this.compPatientSankey = [...this.compPatientSankey];
    }
  }

  loadSankeyData(data: Map<string, GraphDatasource>, obj: any, from: string, to: string, keys: string[]) {
    // All sankey data is split by age, add them together
    let weight = 0;
    keys.forEach(key => {
      weight += data.get(key).total.yAxis[0].data[this.sliderDay];
    });

    // If value is 0 don't add it to sankey
    if (weight) {
      obj.data.push([from, to, weight]);
    }
  }

  loadDataICUChart() {
    // Keys added to arrays -> sum needed
    const dataArray = [
      [
        ModellingScenarioDayResults.StaffedEquippedICUBedsAvailable
      ],
      [
        ModellingScenarioDayResults.ICUAdmissionsA,
        ModellingScenarioDayResults.ICUAdmissionsB,
        ModellingScenarioDayResults.ICUAdmissionsC,
        ModellingScenarioDayResults.ICUAdmissionsD
      ],
      [
        ModellingScenarioDayResults.MovingToICUOverflowA,
        ModellingScenarioDayResults.MovingToICUOverflowB,
        ModellingScenarioDayResults.MovingToICUOverflowC,
        ModellingScenarioDayResults.MovingToICUOverflowD
      ]
    ];

    if (this.data.size) {
      this.ICULineChart = [];
      dataArray.forEach(key => {
        this.loadChartData(this.ICULineChart, this.data, key);
      });
    }

    if (this.comparisonData.size) {
      this.compICULineChart = [];
      dataArray.forEach(key => {
        this.loadChartData(this.compICULineChart, this.comparisonData, key);
      });
    }
  }

  loadDataICUNurses() {
    const dataArray = [
      ModellingScenarioDayResults.OccupiedICUNurses,
      ModellingScenarioDayResults.ICUNursesGap,
      ModellingScenarioDayResults.AvailableICUNurses,
      ModellingScenarioDayResults.AbsentICUNurses
    ];

    if (this.data.size) {
      this.ICUNursesChart = [];
      dataArray.forEach(key => {
        this.loadChartData(this.ICUNursesChart, this.data, key);
      });

      // Create max availalbe ICU nurses line
      this.ICUNursesChartPlotlines = {
        plotLines: [{
          value: this.data.get(ModellingScenarioDayResults.MaxAvailableICUNurses).total.yAxis[0].data[0],
          color: '#ff0000',
          dashStyle: 'longdash',
          width: 2,
          zIndex: 5,
          label: {
            text: 'Total ICU nurses available for pandemic'
          }
        }]
      };
    }

    if (this.comparisonData.size) {
      this.compICUNursesChart = [];
      dataArray.forEach(key => {
        this.loadChartData(this.compICUNursesChart, this.comparisonData, key);
      });

      // Create max availalbe ICU nurses line
      this.compICUNursesChartPlotlines = {
        plotLines: [{
          value: this.comparisonData.get(ModellingScenarioDayResults.MaxAvailableICUNurses).total.yAxis[0].data[0],
          color: '#ff0000',
          dashStyle: 'longdash',
          width: 2,
          zIndex: 5,
          label: {
            text: 'Total ICU nurses available for pandemic'
          }
        }]
      };
    }
  }

  loadChartData(array: object[], map: Map<string, GraphDatasource>, key: string | string[]) {
    let data = [];
    let name = '';

    if (typeof key === 'string') {
      data = map.get(key).total.yAxis[0].data;
      name = ModellingScenarioDayResultsDataMap.get(key).ageLabel
        ? ModellingScenarioDayResultsDataMap.get(key).label + ' (' + ModellingScenarioDayResultsDataMap.get(key).ageLabel + ')'
        : ModellingScenarioDayResultsDataMap.get(key).label;
    }
    else{
      // Get sum array of all keys
      const list = [];
      key.forEach(e => {
        list.push(map.get(e).total.yAxis[0].data);
      });

      data = list[0].map((_x, idx) => list.reduce((sum, curr) => sum + curr[idx], 0));
      name = ModellingScenarioDayResultsDataMap.get(key[0]).label;
    }

    array.push({
      name: name,
      data: data
    });
  }

  loadDataRadar() {
    this.radarChartXAxis = [
      'Peak demand ICU beds vs physical ICU beds available',
      'Peak demand ICU nurses vs max available ICU nurses',
      'Peak demand ventilators vs ventilators available',
      'Peak demand ward beds vs physical ward beds available',
      'Peak demand nurses vs max available nurses',
      'Peak demand PPE vs PPE available'
    ];

    if (this.data.size) {
      this.radarChartSeries = [{
        type: 'line',
        name: 'Resources Available',
        data: []
      },
      {
        type: 'line',
        name: 'Peak Demand',
        data: []
      }];

      this.loadRadarData(this.radarChartSeries, this.data);

      this.radarChartSeries = [...this.radarChartSeries];
    }

    if (this.comparisonData.size) {
      this.compRadarChartSeries = [{
        type: 'line',
        name: 'Resources Available',
        data: []
      },
      {
        type: 'line',
        name: 'Peak Demand',
        data: []
      }];

      this.loadRadarData(this.compRadarChartSeries, this.comparisonData);

      this.compRadarChartSeries = [...this.compRadarChartSeries];
    }
  }

  loadRadarData(array: any[], map: Map<string, GraphDatasource>) {
    this.radarChartXAxis.forEach(_e => {
      array[0].data.push(100);
    });

    const dataArray = [
      {
        available: ModellingScenarioDayResults.PhysicalICUBedsAvailable,
        gap: ModellingScenarioDayResults.PhysicalICUBedsGap
      },
      {
        available: ModellingScenarioDayResults.AvailableICUNurses,
        gap: ModellingScenarioDayResults.ICUNursesGap
      },
      {
        available: ModellingScenarioDayResults.VentilatorsAvailable,
        gap: ModellingScenarioDayResults.GapInVentilators
      },
      {
        available: ModellingScenarioDayResults.PhysicalWardBedsAvailable,
        gap: ModellingScenarioDayResults.PhysicalWardBedsGap
      },
      {
        available: ModellingScenarioDayResults.AvailableNurses,
        gap: ModellingScenarioDayResults.NursesGap
      },
      {
        available: ModellingScenarioDayResults.PandemicPPEStock,
        gap: ModellingScenarioDayResults.PPEGap
      }
    ];

    dataArray.forEach(elem => {
      const maxAvailable = Math.max(...map.get(elem.available).total.yAxis[0].data);
      let demand = maxAvailable
        - map.get(elem.available).total.yAxis[0].data[this.sliderDay]
        - map.get(elem.gap).total.yAxis[0].data[this.sliderDay];
      demand = demand > 0 ? demand : 0;

      array[1].data.push(Math.round((demand * 100 / maxAvailable) * 100) / 100);
    });
  }

  changeChart(event: any): void {
    this.selectedChart = event.value;
    this.loadData();
  }

  sliderDayChanged(event) {
    this.sliderDay = event.value;
  }
}
