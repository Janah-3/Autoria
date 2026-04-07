namespace Autoria.Infrastructure.Email.Models
{
    public class MailSettings
    {
        public string Host { get; set; } = null!;
        public int Port { get; set; }
        public string SenderEmail { get; set; } = null!;
        public string SenderName { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
