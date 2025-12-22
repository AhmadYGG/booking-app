import { CreatePaymentDTO } from "./payment.dto";
import { PaymentRepository } from "./payment.repository";

export class PaymentService {
    constructor(private paymentRepo: PaymentRepository) { }

    async getAll(page: number, limit: number) {
        return await this.paymentRepo.find(page, limit);
    }

    async getByID(id: number) {
        return await this.paymentRepo.findByID(id);
    }

    async processPayment(data: CreatePaymentDTO) {
        // Logic: Create payment which automatically updates booking status via transactional repository
        const payment = await this.paymentRepo.create({
            bookingId: data.bookingId,
            paymentMethod: data.paymentMethod,
            paymentType: data.paymentType,
            amount: data.amount.toString(),
            paymentStatus: 'paid',
            paidAt: new Date(),
        });

        return payment;
    }
}
