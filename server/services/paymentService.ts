import { SpendingService } from './spendingService.js';

export interface TopUpRequest {
  idempotencyKey: string;
  amountUsd: number;
  paymentMethod?: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string | number;
  amountUsd: number;
  status: string;
  paymentMethod: string;
  description: string;
  idempotencyKey: string;
  isDuplicate: boolean;
  timestamp: number;
}

/**
 * Payment & Budget Top-up Service.
 * Implements IETF Idempotency Key protection to guarantee duplicate payment prevention.
 */
export class PaymentService {
  /**
   * Process a budget top-up payment with strict duplicate payment prevention.
   */
  static processTopUp(params: TopUpRequest): PaymentResult {
    const { idempotencyKey, amountUsd, paymentMethod = 'card', description = 'CodeSage Budget Top-Up' } = params;

    if (!idempotencyKey || typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) {
      throw new Error('idempotencyKey is required for payment operations.');
    }

    if (typeof amountUsd !== 'number' || amountUsd <= 0 || isNaN(amountUsd) || amountUsd > 250) {
      throw new Error('amountUsd must be a positive number up to $250.00.');
    }

    // Call SpendingService with idempotency enforcement
    const result = SpendingService.recordPayment({
      idempotencyKey: idempotencyKey.trim(),
      amountUsd,
      paymentMethod,
      description,
    });

    const tx = result.transaction;

    return {
      success: true,
      transactionId: tx.id || tx.idempotency_key,
      amountUsd: tx.amount_usd,
      status: tx.status,
      paymentMethod: tx.payment_method,
      description: tx.description,
      idempotencyKey: tx.idempotency_key,
      isDuplicate: result.isDuplicate,
      timestamp: tx.timestamp || Date.now(),
    };
  }

  /**
   * Get payment transaction audit history.
   */
  static getHistory(): any[] {
    return SpendingService.getPaymentHistory();
  }

  /**
   * Get paginated payment transaction audit history.
   */
  static getPaginatedHistory(options: { page?: number; limit?: number; status?: string } = {}) {
    return SpendingService.getPaginatedPayments(options);
  }
}
