import { GetStorage } from '@/data/protocols/cache'

import casual from 'casual'

export class GetStorageSpy implements GetStorage {
  key: string = '';
  value: any = casual.random_element;

  get(key: string): any {
    this.key = key;
    return this.value;
  }
}
