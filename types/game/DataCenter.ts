import { World } from './World';

export interface DataCenter {
  name: string;
  region: string;
  worlds: World[];
}
