namespace Autoria.features.Payments.Services
{
    public interface IMockPaymentGateway
    {
        Task<MockPaymentResult> ProcessCardPaymentAsync(decimal amount, string cardToken);
    }    
}
