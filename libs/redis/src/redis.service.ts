import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis();
  }
  public getClient(): Redis {
    return this.redis;
  }
  public async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }
  public async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }
  public async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
  // cache with expiration
  public async setCache(
    key: string,
    value: string,
    ttl: number,
  ): Promise<void> {
    await this.redis.set(key, value, 'EX', ttl);
  }
  public async getCache(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }
  public async delCache(key: string): Promise<void> {
    await this.redis.del(key);
  }
  public async flushAll(): Promise<void> {
    await this.redis.flushall();
  }
  public async disconnect(): Promise<void> {
    await this.redis.quit();
  }
  public async isConnected(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
  public async deleteCacheByPattern(pattern: string): Promise<void> {
    const stream = this.redis.scanStream({
      match: pattern,
      count: 100,
    });
    stream.on('data', (keys: string[]) => {
      if (keys.length) {
        const pipeline = this.redis.pipeline();
        keys.forEach((key) => pipeline.del(key));
        pipeline.exec();
      }
    });
    return new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }
}
