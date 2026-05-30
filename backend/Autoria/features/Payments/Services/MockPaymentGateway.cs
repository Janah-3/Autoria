namespace Autoria.features.Payments.Services
{
    public class MockPaymentGateway : IMockPaymentGateway
    {
        public Task<MockPaymentResult> ProcessCardPaymentAsync(decimal amount, string cardToken)
        {
            // Simulate gateway — always succeeds for graduation project
            // In real integration: call Paymob/Stripe API here
            var result = new MockPaymentResult
            {
                Success = true,
                TransactionId = $"TXN-{Guid.NewGuid().ToString()[..8].ToUpper()}"
            };

            return Task.FromResult(result);
        }
    }
}
