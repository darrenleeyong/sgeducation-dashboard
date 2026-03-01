export interface FilterState {
  yearStart: number;
  yearEnd: number;
  schoolLevel: string;
  race: string;
  subject: string;
}

export const DEFAULT_FILTERS: FilterState = {
  yearStart: 2020,
  yearEnd: 2024,
  schoolLevel: "all",
  race: "all",
  subject: "English",
};

export interface DatasetRow {
  [key: string]: string | number;
}

export interface DatasetResponse {
  code: number;
  data: {
    rows: DatasetRow[];
    resourceId: string;
    resourceName: string;
    limit: number;
    links?: {
      next?: string;
    };
  };
  errorMsg?: string;
}

export interface PSLERecord {
  year: number;
  subject: string;
  achievement_level: string;
  sex: string;
  race?: string;
  count: number;
}

export interface EnrolmentRecord {
  year: number;
  level: string;
  sex: string;
  enrolment: number;
}

export interface ClassSizeRecord {
  year: number;
  level: string;
  size: number;
}

export interface PupilTeacherRecord {
  year: number;
  ratio: number;
}

export interface SchoolTypeRecord {
  year: number;
  school_type: string;
  count: number;
}

export interface TeacherRecord {
  year: number;
  sex?: string;
  count: number;
}

export interface SchoolInfoRecord {
  school_name: string;
  address: string;
  zone: string;
  type: string;
}

export const DATASET_IDS = {
  psleEnglish: "d_17527c14ac471b7e9a2feea9581fcdeb",
  psleMath: "d_960c70a482ce481802ab8fb0a0eca8b2",
  psleMotherTongue: "d_0787520bb7a9bed16d5a7b8e964805b1",
  psleScience: "d_078f6d42ad39d1a80c505d0b3fc7c90f",
  // T-score data (1997-2020)
  psleEnglishOld: "d_cd2cd1d40af4b1f8a533a575d87a4367",
  psleMathOld: "d_b860a6f506c921b8fd6cb3667f419db2",
  psleMotherTongueOld: "d_4e0be8a8b4cb7fc3b43f2c82d9799fc2",
  psleScienceOld: "d_af6f5cd97fd8f5497258f059cb044185",
  pupilsPerTeacher: "d_bc5a1a10afedf7d25128dae1342c9556",
  schoolTypes: "d_217c93afee788f476404c42fe4de0249",
  enrolment: "d_8f8256f8af68bfbb63ae449c6546c34f",
  classSizes: "d_bb5f828263a942a9af869eccf9b0068d",
  teachersInSchools: "d_b09a1596075c5d694af7c23bbef87f53",
  schoolInfo: "d_688b934f82c1059ed0a6993d2a829089",
} as const;

export type DatasetId = (typeof DATASET_IDS)[keyof typeof DATASET_IDS];

export const YEAR_OPTIONS = Array.from({ length: 44 }, (_, i) => 1982 + i); // Data available from 1982 to 2025

export const SCHOOL_LEVELS = ["all", "P1", "P2", "P3", "P4", "P5", "P6"] as const;

export const RACES = ["all", "Chinese", "Malay", "Indian", "Others"] as const;

export const SUBJECTS = [
  "all",
  "English",
  "Mathematics",
  "Mother Tongue",
  "Science",
] as const;

export const TAB_VALUES = [
  "primary",
  "secondary",
  "jc",
  "polytechnic",
  "university",
] as const;

export const TAB_LABELS: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  jc: "JC",
  polytechnic: "Polytechnic",
  university: "University",
};
