import { profDevStore, type ProfDev } from '@/data/mock/profDev';
import { psyEduStore, type PsychoEducation } from '@/data/mock/psyEdu';
import { reflectStore, type SelfReflection } from '@/data/mock/reflect';
import { makeCrudService } from '@/services/crud';

export const reflectService = makeCrudService<SelfReflection>('/api/reflect', reflectStore);
export const psyEduService = makeCrudService<PsychoEducation>('/api/psy-edu', psyEduStore);
export const profDevService = makeCrudService<ProfDev>('/api/prof-dev', profDevStore);
