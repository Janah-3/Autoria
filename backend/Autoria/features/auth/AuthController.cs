using Autoria.features.auth.Commands.ChangePassword;
using Autoria.features.auth.Commands.forgetPassword;
using Autoria.features.auth.Commands.Login;
using Autoria.features.auth.Commands.logout;
using Autoria.features.auth.Commands.register;
using Autoria.features.auth.Commands.ResendVerificationEmail;
using Autoria.features.auth.Commands.ResetPassword;
using Autoria.features.auth.Commands.VerifyEmail;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace Autoria.features.auth
{
   
    public class AuthController : BaseController
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginCommand command)
        {
            var result = await _mediator.Send(command);

            
                return Success(result);
            

        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterCommand command)
        {
            var result = await _mediator.Send(command);

            return Success(result, "Registration successful");
        }

        [HttpPost("forgetPass")]
        public async Task<IActionResult> ForgetPass(ForgetPassCommand command)
        {
            await _mediator.Send(command);

            return Success("A password reset link has been sent to your email.");
        }

        [HttpPost("resetPass")]
        public async Task<IActionResult> ResetPassword(ResetPassCommand command)
        {
            await _mediator.Send(command);

            return Success("Password has been reset successfully.");
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout(LogoutCommand command)
        {
            await _mediator.Send(command);

            return Success("Logged out successfully.");
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail(VerifyEmailCommand command)
        {
            await _mediator.Send(command);

            return Success("Email verified successfully.");
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification(ResendVerificationEmailCommand command)
        {
            await _mediator.Send(command);

            return Success("Verification email has been sent.");
        }

        [HttpPatch("changePassword")]
        public async Task<IActionResult> ChangePassword(ChangePasswordCommand command)
        {
            await _mediator.Send(command);

            return Success("Password changed successfully.");
        }
    }
}
