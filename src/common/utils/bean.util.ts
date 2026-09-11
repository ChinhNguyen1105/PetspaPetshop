import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class BeanUtil {
  private static moduleRef: ModuleRef;

  constructor(moduleRef: ModuleRef) {
    BeanUtil.moduleRef = moduleRef;
  }

  static getBean<T>(beanClass: new (...args: any[]) => T): T {
    if (!BeanUtil.moduleRef) {
      throw new Error('ModuleRef has not been initialized');
    }

    return BeanUtil.moduleRef.get(beanClass, {
      strict: false,
    });
  }
}
