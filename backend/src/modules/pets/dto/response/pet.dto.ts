export class PetDto {
  id: number;
  ownerId: string;
  name: string;
  specie: string;
  gender: string;
  birthday: Date;
  weight: number;
  healthStatus: string;
  activeFlag: boolean;
  deleteFlag: boolean;
}
