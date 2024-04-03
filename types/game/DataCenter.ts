import { Region } from '../../service/servers';
import { World } from './World';

export interface DataCenter {
  name: string;
  region: Region;
  worlds: World[];
}
