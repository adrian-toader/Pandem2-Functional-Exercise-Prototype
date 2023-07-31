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
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
// @ts-ignore
import Highcharts from 'highcharts';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';
import * as _ from 'lodash';
import { HumanResourceStaffTypes } from 'src/app/core/entities/humanResources-data.entity';
import { DoseType, Population } from 'src/app/core/entities/vaccination-data.entity';
import { TestSubcategoryValues } from 'src/app/core/entities/testing-data.entity';
import { ParticipatorySurveillanceSubcategories, ParticipatorySurveillanceVisitTypes } from 'src/app/core/entities/participatorySurveillance-data.entity';
import { DeathSubcategories } from 'src/app/core/entities/death-data.entity';
import { CaseSubcategories } from 'src/app/core/entities/case-data.entity';
import { PatientAdmissionType } from 'src/app/core/entities/patient-data.entity';
import { BedOccupationTypeValues, BedTypeValues } from 'src/app/core/entities/bed-data.entity';
import { StorageService } from '../../../../core/services/helper/storage.service';
import { DateFormatISODate, PeriodTypes } from '../../../../shared/constants';
import * as moment from 'moment';
import { Constants, GRAPH_FILTER_BUTTONS, LinearLog } from '../../../../core/models/constants';

export class Indicator {
  name: string;
  params?: {
    module: string,
    filter?: any,
  };
  options?: any;
  isLoading?: boolean;
  hasTotalType?: boolean;
}

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.less']
})

export class ExplorationComponent implements OnInit {
  public static Indicators: Indicator[] = [
    {
      name: 'Case Notifications',
      params: {
        module: 'cases',
        filter: {
          subcategory: [CaseSubcategories.Notification]
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Cases Identified',
      params: {
        module: 'contact-tracing',
        filter: 'CasesIdentified'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Cases Reached',
      params: {
        module: 'contact-tracing',
        filter: 'CasesReached'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Cases Reached In A Day',
      params: {
        module: 'contact-tracing',
        filter: 'CasesReachedInADay'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Cases Reproduction Number',
      params: {
        module: 'cases',
        filter: {
          subcategory: CaseSubcategories.ReproductionNumber
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Cases Incidence Rate',
      params: {
        module: 'cases',
        filter: {
          subcategory: CaseSubcategories.IncidenceRate
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Confirmed Cases',
      params: {
        module: 'cases',
        filter: {
          subcategory: CaseSubcategories.Confirmed
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Contacts Identified',
      params: {
        module: 'contact-tracing',
        filter: 'ContactsIdentified'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Contacts Reached',
      params: {
        module: 'contact-tracing',
        filter: 'ContactsReached'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Contacts Reached In A Day',
      params: {
        module: 'contact-tracing',
        filter: 'ContactsReachedInADay'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Deaths',
      params: {
        module: 'deaths',
        filter: {
          subcategory: DeathSubcategories.Death
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Excess Mortality',
      params: {
        module: 'deaths',
        filter: {
          subcategory: DeathSubcategories.Excess
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Hospital ICU Staff',
      params: {
        module: 'human-resources',
        filter: {
          staffType: HumanResourceStaffTypes.ICU
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospital Staff',
      params: {
        module: 'human-resources'
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospital Ward Staff',
      params: {
        module: 'human-resources',
        filter: {
          staffType: HumanResourceStaffTypes.Ward
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - Admissions',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'patients',
          admission_type: PatientAdmissionType.Hospital,
          split: 'admission_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - Bed Occupancy',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'beds',
          bed_type: BedTypeValues.Hospital,
          split: 'bed_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - Bed Occupancy With X',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'beds',
          bed_type: BedTypeValues.Hospital,
          occupation_type: BedOccupationTypeValues.COVID19,
          split: 'bed_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - ICU Admissions',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'patients',
          admission_type: PatientAdmissionType.ICU,
          split: 'admission_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - ICU Occupancy',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'beds',
          bed_type: BedTypeValues.ICU,
          split: 'bed_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Hospitalisations - ICU Occupancy With X',
      params: {
        module: 'hospitalisations',
        filter: {
          model: 'beds',
          bed_type: BedTypeValues.ICU,
          occupation_type: BedOccupationTypeValues.COVID19,
          split: 'bed_type'
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Mortality Rate',
      params: {
        module: 'deaths',
        filter: {
          subcategory: DeathSubcategories.MortalityRate
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Active Weekly Users',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.ActiveWeeklyUsers,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Avian Influenza Incidence (Avian Influenza/per 1000)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.CovidIncidence
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Emergency Visits (Avian Influenza/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.Emergency,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - GP Visits (Avian Influenza/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.GP,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Hospital Visits (Avian Influenza/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.Hospital,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Incidence (Avian Influenza/per 1000)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.ILIIncidence,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - No Visits (Avian Influenza/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.NoVisit,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Plan Visits (Avian Influenza/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.Plan,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Participatory Surveillance - Other Visits (Avian Influenza9/per 100)',
      params: {
        module: 'participatory-surveillance',
        filter: {
          subcategory: ParticipatorySurveillanceSubcategories.VisitsCumulative,
          visitType: ParticipatorySurveillanceVisitTypes.Other,
          periodType: PeriodTypes.Weekly
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Public Hospital Staff',
      params: {
        module: 'human-resources',
        filter: {
          staffType: HumanResourceStaffTypes.Public
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Recovered Cases',
      params: {
        module: 'cases',
        filter: {
          subcategory: CaseSubcategories.Recovered
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Vaccination Partially - All Population',
      params: {
        module: 'vaccinations',
        filter: {
          doseType: DoseType.OneDose,
          population: Population.AllPopulation
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Vaccination Partially - EMA Recomended Population',
      params: {
        module: 'vaccinations',
        filter: {
          doseType: DoseType.OneDose,
          population: Population.EMARecommendedPopulation
        }
      },
      isLoading: false,
      hasTotalType: false
    },
    {
      name: 'Tests Performed',
      params: {
        module: 'testing',
        filter: {
          subcategory: TestSubcategoryValues.TestsPerformed
        }
      },
      isLoading: false,
      hasTotalType: true
    },
    {
      name: 'Tests Positivity Rate',
      params: {
        module: 'testing',
        filter: {
          subcategory: TestSubcategoryValues.PositivityRate
        }
      },
      isLoading: false,
      hasTotalType: true
    }
  ];

  indicators: Indicator[] = ExplorationComponent.Indicators;
  Highcharts: typeof Highcharts = Highcharts;

  colors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f'];

  allRegions = [];
  toggleStyle = ['primary-button', 'primary-button-selected'];
  toggleArray = [1, 0, 0, 0];
  nutsLevel = 0;
  formControl = new UntypedFormControl();
  countryList = [];
  regionCount = 0;
  maxRegions = false;
  selectedFilter = 'country';
  selectedCountries = [];
  selectedIndicators = [];
  countryControl = new UntypedFormControl();
  indicatorControl = new UntypedFormControl();
  isReloading = true;

  dataInterval = '7days';
  plotType: LinearLog = Constants.linear;
  isLog = false;
  dataType = 'Absolute';
  displayTotalType = true;
  configuredDateInterval = false;
  configuredStartDate?;
  startDate;
  endDate;
  displayStartDate;
  displayEndDate;

  // Constants
  graphFilterButtons = GRAPH_FILTER_BUTTONS;

  constructor(
    protected nutsData: NutsDataService,
    protected cdr: ChangeDetectorRef,
    protected storageService: StorageService
  ) {
  }

  ngOnInit(): void {
    this.nutsData.getRegions(this.nutsLevel.toString()).subscribe((data) => {
      this.countryList = _.orderBy(data, ['name'], ['asc']);
      this.allRegions =  _.orderBy(data, ['name'], ['asc']);
    });
    this.indicatorControl.setValue([]);
    this.countryList.forEach(x => x.children = []);

    // get user settings and use data interval
    const userDataInterval = this.storageService.getUserDataInterval();

    if (userDataInterval && userDataInterval.custom) {
      this.configuredDateInterval = true;
      if (userDataInterval.startDate) {
        this.startDate = this.configuredStartDate = userDataInterval.startDate.format(DateFormatISODate);
        this.displayStartDate = userDataInterval.startDate.format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
      }
      if (userDataInterval.endDate) {
        this.endDate = userDataInterval.endDate.format(DateFormatISODate);
        this.displayEndDate = userDataInterval.endDate.format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
      }
    }

    // always get data until current day
    if (!this.endDate) {
      this.endDate = moment().format(DateFormatISODate);
      this.displayEndDate = moment().format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    }

    // default start from 3 months earlier
    if (moment.utc(this.startDate).isBefore(moment.utc(this.endDate).subtract(3, 'months'))) {
      this.startDate = moment(this.endDate).subtract(3, 'months').format(DateFormatISODate);
      this.displayStartDate = moment(this.endDate).subtract(3, 'months').format(Constants.DEFAULT_DATE_DISPLAY_FORMAT);
    }
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

  switchToggle(array, nuts): void {
    this.toggleArray = array;
    this.nutsLevel = nuts;
    this.countryControl.setValue([]);
    this.selectedCountries = [];
    this.nutsData.getRegions(this.nutsLevel.toString()).subscribe((data) => {
      this.allRegions = _.orderBy(data, ['name'], ['asc']);
      if (this.nutsLevel !== 0) {
        for (const item of this.countryList)
        {
          const localFind = this.allRegions.filter(x => x.code.includes(item.code));
          item.children = _.orderBy(localFind, ['name'], ['asc']);
        }
        // this.updateCountryList();
      }
    });
  }

  checked(value): void {
    if (value.checked === true) {
      value.source.value.checked = true;
      this.selectedCountries.push(value.source.value);
      this.countryControl.setValue(this.selectedCountries);
      this.regionCount = this.selectedCountries.length;
    }
    else {
      value.source.value.checked = false;
      const index = this.selectedCountries.indexOf(value.source.value);
      this.selectedCountries.splice(index, 1);
      this.countryControl.setValue(this.selectedCountries);
      this.regionCount = this.selectedCountries.length;
    }
    this.maxRegions = this.regionCount >= 8;
    this.selectedCountries.forEach(x => x.color = this.colors[this.selectedCountries.indexOf(x)]);
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another list to trigger the change detector
    this.selectedCountries = this.selectedCountries.slice();
  }

  changed(): void {
    if (this.countryControl.value.length < 9) {
      this.selectedCountries = this.countryControl.value;
      this.updateCountryList();
    }
    else {
      this.countryControl.setValue(this.selectedCountries);
    }
    this.maxRegions = this.regionCount >= 8;
    this.selectedCountries.forEach(x => x.color = this.colors[this.selectedCountries.indexOf(x)]);
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another list to trigger the change detector
    this.selectedCountries = this.selectedCountries.slice();
  }

  removeCountry(country): void {
    const index = this.selectedCountries.indexOf(country);
    if (index >= 0) {
      this.selectedCountries.splice(index, 1);
    }
    this.countryControl.setValue(this.selectedCountries);
    this.updateCountryList();
    this.selectedCountries.forEach(x => x.color = this.colors[this.selectedCountries.indexOf(x)]);
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another list to trigger the change detector
    this.selectedCountries = this.selectedCountries.slice();
  }

  changedIndicator(): void {
    this.selectedIndicators = this.indicatorControl.value;
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another list to trigger the change detector
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
    // If you add or remove elements from an array angular doesn't detect the changes, slice is used to create another list to trigger the change detector
    this.selectedIndicators = this.selectedIndicators.slice();

    this.displayTotalType = !this.selectedIndicators.some(i => i.hasTotalType === false);
  }

  updateCountryList(): void {
    const localCountryList = this.countryList;
    if (this.nutsLevel === 0) {
      for (const item of localCountryList) {
        item.checked = this.selectedCountries.includes(item);
      }
    }
    else {
      for (const item of localCountryList) {
        for (const child of item.children) {
          child.checked = this.selectedCountries.includes(child);
        }
      }
    }

    this.regionCount = this.countryControl.value.length;
    this.countryList = localCountryList;
  }
}
