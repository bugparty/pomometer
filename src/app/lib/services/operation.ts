import { getDb } from '../database';
import type { SyncOperation, OperationPayload } from '../../types/api';

// 操作日志服务
export class OperationService {
  // 记录操作
  async logOperation(
    userId: string,
    operationType: string,
    payload: OperationPayload,
    timestamp: string
  ): Promise<void> {
    const db = await getDb();

    await db.operation.create({
      data: {
        userId,
        operationType,
        payload: JSON.stringify(payload),
        timestamp: new Date(timestamp)
      }
    });
  }

  // 获取操作记录
  async getOperationsSince(userId: string, since: string): Promise<SyncOperation[]> {
    const db = await getDb();

    const operations = await db.operation.findMany({
      where: {
        userId,
        timestamp: { gt: new Date(since) }
      },
      orderBy: { timestamp: 'asc' }
    });

    return operations.map((op): SyncOperation => ({
      type: op.operationType,
      payload: JSON.parse(op.payload),
      timestamp: op.timestamp.toISOString()
    }));
  }
}

