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
import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModellingModelParameter, ModellingScenarioParameter } from 'src/app/core/models/modelling-data.model';
import { ModellingDataService } from 'src/app/core/services/data/modelling.data.service';
import * as _ from 'lodash';
import { ModellingModelDataParameterKeys, ModellingModelParameterCategories, ModellingModelParameterSubcategories, ModellingModelParameterTypes, ModellingModelParameterValueAgeTypeLabels, ModellingModelResourceAllocationKeys } from 'src/app/core/entities/modelling-data.entity';
import { NutsDataService } from 'src/app/core/services/data/nuts.data.service';
import { NUTS_LEVEL_0 } from 'src/app/core/entities/region.entity';
import { firstValueFrom, ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-modelling-info-dialog',
  templateUrl: './modelling-info-dialog.component.html',
  styleUrls: ['./modelling-info-dialog.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ModellingInfoDialogComponent implements OnInit, OnDestroy {
  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  paramsReady = false;
  hasComparison = false;
  scenarioName: string;
  comparisonScenarioName: string;
  scenarioRegionName: string;
  scenarioParams: ModellingModelParameter[];
  scenarioDataParams: ModellingModelParameter[];
  comparisonScenarioParams: ModellingModelParameter[];
  paramsDisplay = [];

  displayTabDescriptions: Map<string, string> = new Map([
    [ModellingModelParameterCategories.PublicHealthPolicies, 'Vaccination, lockdown, mask wearing, testing'],
    [ModellingModelParameterCategories.DiseaseSeverity, 'Hospitalisation rates, length of stay, fatality rates'],
    [ModellingModelParameterCategories.HospitalResources, 'Pandemic resource allocation, resource usage rates, PPE'],
    [ModellingModelParameterCategories.HospitalSurgeStrategies, 'Reducing resource consumption & Increasing capacity'],
    [ModellingModelParameterCategories.ModellingOptions, 'Optional model behaviour and settings'],
    [ModellingModelParameterCategories.RegionalData, 'Population, contact rates & resource data']
  ]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public injectedData: any,
    private modellingDataService: ModellingDataService,
    protected nutsData: NutsDataService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  async ngOnInit() {
    // Get scenario names from injected data
    this.scenarioName = this.injectedData.scenarioName;
    this.comparisonScenarioName = this.injectedData.comparisonScenarioName;
    this.hasComparison = this.injectedData.run2 ? true : false;
    let comparisonParams = this.injectedData.run2;

    // If comparisonScenarioId is injected and no run2 is present
    // Load scenario with comparisonScenarioId
    if (this.injectedData.comparisonScenarioId && !this.injectedData.run2) {
      const comparisonScenario = await firstValueFrom(
        this.modellingDataService.getScenarioDetails(
          this.injectedData.comparisonScenarioId
        ).pipe(takeUntil(this.destroyed$))
      );
      if (comparisonScenario) {
        this.comparisonScenarioName = comparisonScenario.name;
        comparisonParams = comparisonScenario.parameters;
        this.hasComparison = true;
      }
    }

    // Get region name
    if (this.injectedData.scenarioRegionCode) {
      this.nutsData.getRegions(NUTS_LEVEL_0).subscribe(data => {
        this.scenarioRegionName = data.find(e => e.code === this.injectedData.scenarioRegionCode)?.name;
      });
    }

    // Get list of parameters (with details) from model
    this.modellingDataService.getModelList().subscribe(data => {
      this.scenarioParams = data.find(e => e.id === this.injectedData.modelId).parameters.filter(e => e.category.toLowerCase() !== 'data');
      this.scenarioDataParams = data.find(e => e.id === this.injectedData.modelId).parameters.filter(e => e.category.toLowerCase() === 'data');
      this.comparisonScenarioParams = _.cloneDeep(this.scenarioParams);

      // Update parameter values
      this.updateParams(this.scenarioParams, this.injectedData.run1);

      // Update data parameter values
      this.updateParams(this.scenarioDataParams, this.injectedData.run1);

      // If there is a second scenario, update comparison params
      if (this.hasComparison) {
        this.updateParams(this.comparisonScenarioParams, comparisonParams);
      }

      // Create object for displaying parameters
      this.createParamsDisplay();

      this.paramsReady = true;
    });
  }

  updateParams(scenarioParamsArray: ModellingModelParameter[], newValues: ModellingScenarioParameter[]) {
    scenarioParamsArray.forEach(param => {
      const newValue = newValues.find(e => e.key === param.key);
      if (newValue) {
        param.values = newValue.values;
      }
    });
  }

  createParamsDisplay() {
    this.scenarioParams.forEach(param => {
      // Create categories
      let categoryIndex = this.paramsDisplay.findIndex(e => e.category === param.category);
      if (categoryIndex === -1) {
        this.paramsDisplay.push({
          category: param.category,
          description: this.displayTabDescriptions.get(param.category) || undefined,
          subcategories: []
        });
      }

      // After creating category, find it's index
      categoryIndex = this.paramsDisplay.findIndex(e => e.category === param.category);

      // Create subcategories
      let subcategoryIndex = this.paramsDisplay[categoryIndex].subcategories.findIndex(e => e.subcategory === param.subcategory);
      if (subcategoryIndex === -1) {
        this.paramsDisplay[categoryIndex].subcategories.push({ subcategory: param.subcategory, inputs: [] });
      }

      // After creating subcategory, find it's index
      subcategoryIndex = this.paramsDisplay[categoryIndex].subcategories.findIndex(e => e.subcategory === param.subcategory);

      // Create inputs
      this.paramsDisplay[categoryIndex].subcategories[subcategoryIndex].inputs.push({
        name: param.name,
        type: param.type,
        values: [...[param.values.map(e => ({
          ...e,
          ageLabel: ModellingModelParameterValueAgeTypeLabels[e.age]
        }))]]
      });
    });

    // Add second run parameters if existent
    if (this.hasComparison) {
      this.comparisonScenarioParams.forEach(param => {
        // Add second run value to values array
        const categoryIndex = this.paramsDisplay.findIndex(e => e.category === param.category);
        const subcategoryIndex = this.paramsDisplay[categoryIndex].subcategories.findIndex(e => e.subcategory === param.subcategory);
        const inputIndex = this.paramsDisplay[categoryIndex].subcategories[subcategoryIndex].inputs.findIndex(e => e.name === param.name);
        if (inputIndex !== -1) {
          this.paramsDisplay[categoryIndex].subcategories[subcategoryIndex].inputs[inputIndex].values.push(param.values.map(e => ({
            ...e,
            ageLabel: ModellingModelParameterValueAgeTypeLabels[e.age]
          })));
        }
      });
    }

    // Create regional data
    this.createRegionalData();
  }

  createRegionalData() {
    // Create regional data with subcategories
    this.paramsDisplay.push({
      category: ModellingModelParameterCategories.RegionalData,
      description: this.displayTabDescriptions.get(ModellingModelParameterCategories.RegionalData) || undefined,
      subcategories: [
        { subcategory: ModellingModelParameterSubcategories.Population, inputs: [] },
        { subcategory: ModellingModelParameterSubcategories.ContactRates, inputs: [] },
        { subcategory: ModellingModelParameterSubcategories.ProbabilityOfInfection, inputs: [] },
        { subcategory: ModellingModelParameterSubcategories.ResourceParameters, inputs: [] },
        { subcategory: ModellingModelParameterSubcategories.ResourcesCalculatedForThePopulation, inputs: [] },
        { subcategory: ModellingModelParameterSubcategories.TotalBedCapacity, inputs: [] },
        { subcategory: ModellingModelParameterSubcategories.PandemicBedCapacity, inputs: [] }
      ]
    });

    // Add inputs for each subcategory
    const regionalData = this.paramsDisplay[this.paramsDisplay.length - 1];

    // Get all subcategories
    const populationSubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.Population);
    const contactRatesSubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.ContactRates);
    const probabilityOfInfectionSubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.ProbabilityOfInfection);
    const resourceParametersSubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.ResourceParameters);
    const resourcesCalculatedSubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.ResourcesCalculatedForThePopulation);
    const totalBedCapacitySubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.TotalBedCapacity);
    const pandemicBedCapacitySubcategory = regionalData.subcategories.find(e => e.subcategory === ModellingModelParameterSubcategories.PandemicBedCapacity);

    // Population
    const populationSizeParam = this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.PopulationSize);
    const totalPopulation = populationSizeParam.values.reduce((acc, curr) => acc + (curr.value as number), 0);
    this.addPopulationParams(populationSubcategory.inputs, populationSizeParam, totalPopulation);

    // Contact Rates
    const contactRatesParam = this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.AgeSpecificContactRates);
    const contactRatesData = contactRatesParam.values.map(e => ({
      name: e.ageContact,
      values: [e.value as number]
    }));
    this.addParams(contactRatesSubcategory.inputs, contactRatesData);

    // Probability of infection
    const probabilityOfInfection = this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.ProbabilityOfInfection)?.values[0]?.value as number || 0;
    const probabilityOfInfectionData = [
      {
        name: 'Probability of infection',
        values: [probabilityOfInfection]
      }
    ];
    this.addParams(probabilityOfInfectionSubcategory.inputs, probabilityOfInfectionData);

    // Resource parameters
    const resourceParameters = {
      wardBedsPer1K: this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.WardBedsPer1K)?.values[0]?.value as number || 0,
      wardNursesPer1K: this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.WardNursesPer1K)?.values[0]?.value as number || 0,
      ICUBedsPer100K: this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.ICUBedsPer100K)?.values[0]?.value as number || 0,
      ICUNursesPer100K: this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.ICUNursesPer100K)?.values[0]?.value as number || 0,
      ventilatorsPer100K: this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.VentilatorsPer100K)?.values[0]?.value as number || 0,
      physiciansPer100K: this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.PhysiciansPer100K)?.values[0]?.value as number || 0,
      morgueCapacity: this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.MorgueCapacityPer100K)?.values[0]?.value as number || 0,
      targetPPEStock: this.scenarioDataParams.find(e => e.key === ModellingModelDataParameterKeys.TargetPPEStockPer1K)?.values[0]?.value as number || 0
    };

    const resourceParametersData = [
      { name: 'Physical ward beds per 1K', values: [resourceParameters.wardBedsPer1K] },
      { name: 'Ward nurses per 1K', values: [resourceParameters.wardNursesPer1K] },
      { name: 'Physical ICU beds per 100K', values: [resourceParameters.ICUBedsPer100K] },
      { name: 'ICU nurses per 100K', values: [resourceParameters.ICUNursesPer100K] },
      { name: 'Ventilators per 100K', values: [resourceParameters.ventilatorsPer100K] },
      { name: 'Physicians per 100K', values: [resourceParameters.physiciansPer100K] },
      { name: 'Normal morgue capacity', values: [resourceParameters.morgueCapacity] },
      { name: 'Normal target PPE stock', values: [resourceParameters.targetPPEStock] }
    ];
    this.addParams(resourceParametersSubcategory.inputs, resourceParametersData);

    // Resource parameters calculated for the population
    const resourcesCalculated = {
      totalWardBeds: Math.round((resourceParameters.wardBedsPer1K * totalPopulation) / 1000),
      totalWardNurses: Math.round((resourceParameters.wardNursesPer1K * totalPopulation) / 1000),
      totalICUBeds: Math.round((resourceParameters.ICUBedsPer100K * totalPopulation) / 100000),
      totalICUNurses: Math.round((resourceParameters.ICUNursesPer100K * totalPopulation) / 100000),
      totalVentilators: Math.round((resourceParameters.ventilatorsPer100K * totalPopulation) / 100000),
      totalPhysicians: Math.round((resourceParameters.physiciansPer100K * totalPopulation) / 100000)
    };

    const resourcesCalculatedData = [
      { name: 'Physical ward beds', values: [resourcesCalculated.totalWardBeds] },
      { name: 'Ward nurses', values: [resourcesCalculated.totalWardNurses] },
      { name: 'Physical ICU beds', values: [resourcesCalculated.totalICUBeds] },
      { name: 'ICU nurses', values: [resourcesCalculated.totalICUNurses] },
      { name: 'Ventilators', values: [resourcesCalculated.totalVentilators] },
      {
        name: 'Physicians',
        description: 'Note that physicians are not modelled as a limiting resource.',
        values: [resourcesCalculated.totalPhysicians]
      }
    ];
    this.addParams(resourcesCalculatedSubcategory.inputs, resourcesCalculatedData);

    // Total bed capacity
    const resourceUsageRates = {
      nursesPerBed: this.scenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.NursesPerBed)?.values[0]?.value as number || 0,
      ICUNursesPerBed: this.scenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ICUNursesPerBed)?.values[0]?.value as number || 0,
      fractionRequiringVentilator: this.scenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.FractionICUPatientsRequiringVentilator)?.values[0]?.value as number || 0,
      compNursesPerBed: this.hasComparison ? this.comparisonScenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.NursesPerBed)?.values[0]?.value as number || 0 : undefined,
      compICUNursesPerBed: this.hasComparison ? this.comparisonScenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ICUNursesPerBed)?.values[0]?.value as number || 0 : undefined,
      compFractionRequiringVentilator: this.hasComparison ? this.comparisonScenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.FractionICUPatientsRequiringVentilator)?.values[0]?.value as number || 0 : undefined
    };
    this.createCalculatedTotalBedCapacity(totalBedCapacitySubcategory.inputs, resourcesCalculated, resourceUsageRates);

    // Pandemic bed capacity
    const resourceProportions = {
      beds: this.scenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfBeds)?.values[0]?.value as number || 0,
      ICUBeds: this.scenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfICUBeds)?.values[0]?.value as number || 0,
      nurses: this.scenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfNurses)?.values[0]?.value as number || 0,
      ICUNurses: this.scenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfICUNurses)?.values[0]?.value as number || 0,
      ventilators: this.scenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfVentilators)?.values[0]?.value as number || 0,
      compBeds: this.hasComparison ? this.comparisonScenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfBeds)?.values[0]?.value as number || 0 : undefined,
      compICUBeds: this.hasComparison ? this.comparisonScenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfICUBeds)?.values[0]?.value as number || 0 : undefined,
      compNurses: this.hasComparison ? this.comparisonScenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfNurses)?.values[0]?.value as number || 0 : undefined,
      compICUNurses: this.hasComparison ? this.comparisonScenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfICUNurses)?.values[0]?.value as number || 0 : undefined,
      compVentilators: this.hasComparison ? this.comparisonScenarioParams.find(e => e.key === ModellingModelResourceAllocationKeys.ProportionOfVentilators)?.values[0]?.value as number || 0 : undefined
    };
    this.createCalculatedPandemicBedCapacity(pandemicBedCapacitySubcategory.inputs, resourcesCalculated, resourceUsageRates, resourceProportions);
  }

  createCalculatedTotalBedCapacity(inputs: any[], resourcesCalculated: any, resourceUsageRates: any) {
    const staffedWardBeds = [
      Math.min(
        resourcesCalculated.totalWardBeds,
        Math.round(resourcesCalculated.totalWardNurses / resourceUsageRates.nursesPerBed)
      )
    ];

    const staffedICUBeds = [
      Math.min(
        resourcesCalculated.totalICUBeds,
        Math.round(resourcesCalculated.totalICUNurses / resourceUsageRates.ICUNursesPerBed),
        Math.round(resourcesCalculated.totalVentilators / resourceUsageRates.fractionRequiringVentilator)
      )
    ];

    if (this.hasComparison) {
      staffedWardBeds.push(
        Math.min(
          resourcesCalculated.totalWardBeds,
          Math.round(resourcesCalculated.totalWardNurses / resourceUsageRates.compNursesPerBed)
        )
      );

      staffedICUBeds.push(
        Math.min(
          resourcesCalculated.totalICUBeds,
          Math.round(resourcesCalculated.totalICUNurses / resourceUsageRates.compICUNursesPerBed),
          Math.round(resourcesCalculated.totalVentilators / resourceUsageRates.compFractionRequiringVentilator)
        )
      );
    }

    const totalBedCapacityData = [
      {
        name: 'Staffed ward beds',
        values: staffedWardBeds
      },
      {
        name: 'Staffed ICU beds',
        description: 'Calculations find the operable capacity, limited either by the number of physical beds or the nurse per bed ratios, and for ICU, also by the fraction of patients normally requiring a ventilator, as given below.',
        values: staffedICUBeds
      },
      {
        name: 'Nurses per bed',
        values: this.hasComparison ? [resourceUsageRates.nursesPerBed, resourceUsageRates.compNursesPerBed] : [resourceUsageRates.nursesPerBed]
      },
      {
        name: 'ICU nurses per bed',
        values: this.hasComparison ? [resourceUsageRates.ICUNursesPerBed, resourceUsageRates.compICUNursesPerBed] : [resourceUsageRates.ICUNursesPerBed]
      },
      {
        name: 'Fraction requiring ventilator',
        values: this.hasComparison ? [resourceUsageRates.fractionRequiringVentilator, resourceUsageRates.compFractionRequiringVentilator] : [resourceUsageRates.fractionRequiringVentilator]
      }
    ];
    this.addParams(inputs, totalBedCapacityData);
  }

  createCalculatedPandemicBedCapacity(inputs: any[], resourcesCalculated: any, resourceUsageRates: any, resourceProportions: any) {
    const pandemicStaffedWardBeds = [
      Math.min(
        Math.round(resourcesCalculated.totalWardBeds * resourceProportions.beds),
        Math.round((resourcesCalculated.totalWardNurses * resourceProportions.nurses) / resourceUsageRates.nursesPerBed)
      )
    ];

    const pandemicStaffedICUBeds = [
      Math.min(
        Math.round(resourcesCalculated.totalICUBeds * resourceProportions.ICUBeds),
        Math.round((resourcesCalculated.totalICUNurses * resourceProportions.ICUNurses) / resourceUsageRates.ICUNursesPerBed),
        Math.round((resourcesCalculated.totalVentilators * resourceProportions.ventilators) / resourceUsageRates.fractionRequiringVentilator)
      )
    ];

    if (this.hasComparison) {
      pandemicStaffedWardBeds.push(
        Math.min(
          Math.round(resourcesCalculated.totalWardBeds * resourceProportions.compBeds),
          Math.round((resourcesCalculated.totalWardNurses * resourceProportions.compNurses) / resourceUsageRates.compNursesPerBed)
        )
      );

      pandemicStaffedICUBeds.push(
        Math.min(
          Math.round(resourcesCalculated.totalICUBeds * resourceProportions.compICUBeds),
          Math.round((resourcesCalculated.totalICUNurses * resourceProportions.compICUNurses) / resourceUsageRates.compICUNursesPerBed),
          Math.round((resourcesCalculated.totalVentilators * resourceProportions.compVentilators) / resourceUsageRates.compFractionRequiringVentilator)
        )
      );
    }

    const pandemicBedCapacityData = [
      {
        name: 'Staffed ward beds',
        values: pandemicStaffedWardBeds
      },
      {
        name: 'Staffed ICU beds',
        description: 'Calculations take into account the proportion of resources pre-allocated for pandemic use, as given below.',
        values: pandemicStaffedICUBeds
      },
      {
        name: 'Proportion of beds available for pandemic',
        values: this.hasComparison ? [resourceProportions.beds, resourceProportions.compBeds] : [resourceProportions.beds]
      },
      {
        name: 'Proportion of ICU beds available for pandemic',
        values: this.hasComparison ? [resourceProportions.ICUBeds, resourceProportions.compICUBeds] : [resourceProportions.ICUBeds]
      },
      {
        name: 'Proportion of nurses available for pandemic',
        values: this.hasComparison ? [resourceProportions.nurses, resourceProportions.compNurses] : [resourceProportions.nurses]
      },
      {
        name: 'Proportion of ICU nurses available for pandemic',
        values: this.hasComparison ? [resourceProportions.ICUNurses, resourceProportions.compICUNurses] : [resourceProportions.ICUNurses]
      },
      {
        name: 'Proportion of ventilators available for pandemic',
        values: this.hasComparison ? [resourceProportions.ventilators, resourceProportions.compVentilators] : [resourceProportions.ventilators]
      }
    ];
    this.addParams(inputs, pandemicBedCapacityData);
  }

  addParams(inputs: any[], params: { name: string, description?: string, values: number[] }[]) {
    params.forEach(param => {
      inputs.push({
        name: param.name,
        description: param.description,
        type: ModellingModelParameterTypes.Number,
        values: param.values.map(e => ([{
          value: e
        }]))
      });
    });
  }

  addPopulationParams(inputs: any[], populationParam: ModellingModelParameter, populationTotal: number) {
    inputs.push({
      name: 'Population',
      type: populationParam.type,
      values: [
        populationParam.values.map(e => ({
          value: e.value,
          age: e.age,
          ageLabel: ModellingModelParameterValueAgeTypeLabels[e.age]
        }))
      ]
    });

    inputs.push({
      name: 'Population total',
      type: ModellingModelParameterTypes.Number,
      values: [
        [
          { value: populationTotal }
        ]
      ]
    });
  }
}
