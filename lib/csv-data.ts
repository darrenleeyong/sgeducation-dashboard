export interface ClassSizeRow {
  year: number;
  level_of_education: string;
  level: string;
  no_of_classes: number;
  ave_class_size: number;
}

export interface TeachersPrimaryRow {
  year: number;
  sex: string;
  school_type: string;
  teachers_pri: number;
}

export interface TeachersAgeRow {
  year: number;
  sex: string;
  level_of_school: string;
  age: string;
  no_of_teachers: number;
}

export interface TeachersLengthOfServiceRow {
  year: number;
  sex: string;
  level_of_school: string;
  length_of_service: string;
  no_of_teachers: number;
}

export async function loadClassSizeData(): Promise<ClassSizeRow[]> {
  const response = await fetch('/data/class-size.csv');
  const text = await response.text();
  
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data: ClassSizeRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 5) {
      data.push({
        year: parseInt(values[0]),
        level_of_education: values[1],
        level: values[2],
        no_of_classes: parseInt(values[3]),
        ave_class_size: parseFloat(values[4]),
      });
    }
  }
  
  return data;
}

export async function loadTeachersPrimaryData(): Promise<TeachersPrimaryRow[]> {
  const response = await fetch('/data/teachers-primary.csv');
  const text = await response.text();
  
  const lines = text.trim().split('\n');
  
  const data: TeachersPrimaryRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 4) {
      data.push({
        year: parseInt(values[0]),
        sex: values[1],
        school_type: values[2],
        teachers_pri: parseInt(values[3]),
      });
    }
  }
  
  return data;
}

export async function loadTeachersAgeData(): Promise<TeachersAgeRow[]> {
  const response = await fetch('/data/teachers-age.csv');
  const text = await response.text();
  
  const lines = text.trim().split('\n');
  
  const data: TeachersAgeRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 5) {
      data.push({
        year: parseInt(values[0]),
        sex: values[1],
        level_of_school: values[2],
        age: values[3],
        no_of_teachers: parseInt(values[4]),
      });
    }
  }
  
  return data;
}

export async function loadTeachersLengthOfServiceData(): Promise<TeachersLengthOfServiceRow[]> {
  const response = await fetch('/data/teachers-length-of-service.csv');
  const text = await response.text();
  
  const lines = text.trim().split('\n');
  
  const data: TeachersLengthOfServiceRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 5) {
      data.push({
        year: parseInt(values[0]),
        sex: values[1],
        level_of_school: values[2],
        length_of_service: values[3],
        no_of_teachers: parseInt(values[4]),
      });
    }
  }
  
  return data;
}
