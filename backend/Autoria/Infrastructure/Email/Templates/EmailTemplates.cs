namespace Autoria.Infrastructure.Email.Templates
{
    public class EmailTemplates
    {
        public static string ForgotPassword(string userName, string resetLink) => $"""
        <h2>Hi {userName},</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it. This link expires in 1 hour.</p>
        <a href="{resetLink}"
           style="background:#007bff;color:white;padding:10px 20px;
                  border-radius:5px;text-decoration:none;">
           Reset Password
        </a>
        <p>If you didn't request this, ignore this email.</p>
    """;
    }
}
