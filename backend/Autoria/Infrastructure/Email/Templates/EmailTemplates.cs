namespace Autoria.Infrastructure.Email.Templates
{
    public class EmailTemplates
    {
        private static string Layout(string content) => $"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Autoria</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
                </style>
            </head>
            <body style="margin:0;padding:0;background:#F9F9F9;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F9F9;padding:80px 0;">
                    <tr>
                        <td align="center">
                            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

                                <!-- Header with red accent line -->
                                <tr>
                                    <td style="padding:0 0 48px 0;text-align:center;">
                                        <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;font-weight:400;letter-spacing:4px;color:#1A1A1A;">
                                            AUTORIA
                                        </div>
                                        <div style="width:40px;height:1px;background:#C41E3A;margin:20px auto 0 auto;"></div>
                                    </td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style="background:#FFFFFF;padding:56px 48px;border-radius:2px;box-shadow:0 1px 0 rgba(0,0,0,0.03),0 2px 6px rgba(0,0,0,0.02);">
                                        {content}
                                    </td>
                                </tr>

                                <!-- Footer with red accent -->
                                <tr>
                                    <td style="padding:48px 0 0 0;text-align:center;">
                                        <div style="width:40px;height:1px;background:#C41E3A;margin:0 auto 32px auto;opacity:0.6;"></div>
                                        <p style="margin:0 0 8px 0;font-size:11px;font-weight:400;letter-spacing:0.5px;color:#A3A3A3;">
                                            AUTORIA · CAIRO
                                        </p>
                                        <p style="margin:0;font-size:10px;font-weight:300;letter-spacing:0.3px;color:#BFBFBF;">
                                            This is an automated message. Please do not reply.
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        """;

        public static string ForgotPassword(string userName, string resetLink) => Layout($"""
            <div style="text-align:center;margin-bottom:40px;">
                <h2 style="margin:0 0 16px 0;font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:400;letter-spacing:1px;color:#1A1A1A;">
                    Reset your password
                </h2>
                <div style="width:32px;height:1px;background:#C41E3A;margin:0 auto;"></div>
            </div>

            <p style="margin:0 0 32px 0;font-size:14px;font-weight:400;line-height:1.7;color:#404040;text-align:center;">
                We received a request to reset the password for your Autoria account.
            </p>

            <div style="margin-bottom:40px;">
                <p style="margin:0 0 4px 0;font-size:11px;font-weight:500;letter-spacing:0.5px;color:#A3A3A3;text-transform:uppercase;">
                    Account holder
                </p>
                <p style="margin:0;font-size:18px;font-weight:400;color:#1A1A1A;">
                    {userName}
                </p>
            </div>

            <div style="border-top:1px solid #F0F0F0;border-bottom:1px solid #F0F0F0;padding:24px 0;margin-bottom:40px;">
                <p style="margin:0 0 8px 0;font-size:12px;font-weight:400;color:#737373;line-height:1.6;">
                    This link is valid for one hour. For security, never share this link with anyone.
                </p>
            </div>

            <div style="text-align:center;margin:40px 0;">
                <a href="{resetLink}"
                   style="display:inline-block;background:#1A1A1A;color:#FFFFFF;
                          padding:12px 32px;border-radius:0;text-decoration:none;
                          font-weight:400;font-size:13px;letter-spacing:1.5px;
                          border:1px solid #1A1A1A;transition:all 0.2s ease;">
                    RESET PASSWORD
                </a>
            </div>

            <div style="margin-top:40px;">
                <p style="margin:0;font-size:12px;font-weight:300;color:#A3A3A3;line-height:1.6;text-align:center;">
                    If you did not request this change, you can safely ignore this email.<br/>
                    Your password will remain unchanged.
                </p>
            </div>

            <div style="margin-top:32px;padding-top:24px;border-top:1px solid #F5F5F5;">
                <p style="margin:0;font-size:10px;font-weight:300;color:#BFBFBF;text-align:center;word-break:break-all;font-family:monospace;">
                    {resetLink}
                </p>
            </div>
        """);

        public static string VerifyEmail(string userName, string verificationLink) => Layout($"""
            <div style="text-align:center;margin-bottom:40px;">
                <h2 style="margin:0 0 16px 0;font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:400;letter-spacing:1px;color:#1A1A1A;">
                    Verify your email
                </h2>
                <div style="width:32px;height:1px;background:#C41E3A;margin:0 auto;"></div>
            </div>

            <p style="margin:0 0 32px 0;font-size:14px;font-weight:400;line-height:1.7;color:#404040;text-align:center;">
                Welcome to Autoria. Please verify your email address to complete your registration.
            </p>

            <div style="margin-bottom:40px;">
                <p style="margin:0 0 4px 0;font-size:11px;font-weight:500;letter-spacing:0.5px;color:#A3A3A3;text-transform:uppercase;">
                    Welcome
                </p>
                <p style="margin:0;font-size:18px;font-weight:400;color:#1A1A1A;">
                    {userName}
                </p>
            </div>

            <div style="border-top:1px solid #F0F0F0;border-bottom:1px solid #F0F0F0;padding:24px 0;margin-bottom:40px;">
                <p style="margin:0 0 8px 0;font-size:12px;font-weight:400;color:#737373;line-height:1.6;">
                    This verification link expires in 24 hours. Once verified, you will have full access to your account.
                </p>
            </div>

            <div style="text-align:center;margin:40px 0;">
                <a href="{verificationLink}"
                   style="display:inline-block;background:#1A1A1A;color:#FFFFFF;
                          padding:12px 32px;border-radius:0;text-decoration:none;
                          font-weight:400;font-size:13px;letter-spacing:1.5px;
                          border:1px solid #1A1A1A;">
                    VERIFY EMAIL
                </a>
            </div>

            <div style="margin:40px 0 32px 0;">
                <p style="margin:0 0 20px 0;font-size:11px;font-weight:500;letter-spacing:0.5px;color:#C41E3A;text-align:center;text-transform:uppercase;">
                    After verification
                </p>
                <div style="text-align:center;">
                    <p style="margin:0 0 12px 0;font-size:13px;font-weight:400;color:#404040;">
                        Book service appointments
                    </p>
                    <p style="margin:0 0 12px 0;font-size:13px;font-weight:400;color:#404040;">
                        Manage service history
                    </p>
                    <p style="margin:0 0 12px 0;font-size:13px;font-weight:400;color:#404040;">
                        Reserve spare parts
                    </p>
                    <p style="margin:0;font-size:13px;font-weight:400;color:#404040;">
                        Leave service reviews
                    </p>
                </div>
            </div>

            <div style="margin-top:40px;padding-top:24px;border-top:1px solid #F5F5F5;">
                <p style="margin:0;font-size:12px;font-weight:300;color:#A3A3A3;line-height:1.6;text-align:center;">
                    If you did not create an Autoria account, please disregard this email.
                </p>
            </div>

            <div style="margin-top:24px;">
                <p style="margin:0;font-size:10px;font-weight:300;color:#BFBFBF;text-align:center;word-break:break-all;font-family:monospace;">
                    {verificationLink}
                </p>
            </div>
        """);
    }
}