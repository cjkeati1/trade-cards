export enum OrderStatus {
    // When the order has been created, but the orders
    // it is trying to order has not been reserved
    Created = 'created',

    // The orders the order is trying to reserve has already
    // been reserved, or the user has cancelled the order,
    // or the order expires before payment
    Cancelled = 'cancelled',

    // The order has reserved the orders, and the user has
    // provided payment successfully
    Complete = 'complete',
}
