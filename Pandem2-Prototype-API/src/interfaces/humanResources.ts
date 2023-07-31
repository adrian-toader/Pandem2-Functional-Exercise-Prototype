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
import { TotalType } from 'src/models/bed';
import { StaffType } from 'src/models/humanResource';

export type HumanResourceSplitTypeQuery = 'staff_type';

export interface IDailyHumanResourceFilter {
  location: string;
  total_type: string;
  split?: HumanResourceSplitTypeQuery;
  start_date?: string;
  end_date?: string;
}
 
export interface IDailyHumanResourceCount {
  date: string;
  total: number;
  working_surveillance: number;
  split?: { 
    total: number; 
    working_surveillance?: number; 
    split_value: string; 
  }[];
}

export interface ILocationsDailyHumanResourcesFilter {
  location: string[];
  total_type: TotalType;
  split?: HumanResourceSplitTypeQuery;
  staff_type?: StaffType;
  start_date?: string;
  end_date?: string;
}

export interface ILocationsDailyHumanResourcesCount {
  date: string;
  locations: { code: string, total: number, split?: {
    total: number; 
    working_surveillance?: number; 
    split_value: string; 
  }[] }[];
}

export interface ILocationsHumanResourcesDateIntervalFilter {
  location: string[];
  total_type: TotalType;
  split?: HumanResourceSplitTypeQuery;
  staff_type?: StaffType;
}
