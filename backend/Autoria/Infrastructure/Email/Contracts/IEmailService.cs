namespace Autoria.Infrastructure.Email.Contracts
{
    public interface IEmailService
    {
        Task SendMailAsync(string to , string subject, string body);
    }
}
