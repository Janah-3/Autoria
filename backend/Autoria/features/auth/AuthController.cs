using Autoria.features.auth.Commands.AddAdmin;
using Autoria.features.auth.Commands.ChangePassword;
using Autoria.features.auth.Commands.forgetPassword;
using Autoria.features.auth.Commands.Login;
using Autoria.features.auth.Commands.logout;
using Autoria.features.auth.Commands.RefreshToken;
using Autoria.features.auth.Commands.register;
using Autoria.features.auth.Commands.ResendVerificationEmail;
using Autoria.features.auth.Commands.ResetPassword;
using Autoria.features.auth.Commands.VerifyEmail;
using Autoria.shared.Controllers;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Autoria.features.auth
{
   
    public class AuthController : BaseController
    {
        

        public AuthController(IMediator mediator) : base(mediator) { }

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
        [Authorize]
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
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordCommand command)
        {
            await _mediator.Send(command);

            return Success("Password changed successfully.");
        }


        [HttpPost("AddAdmin")]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> AddAdmin(AddAdminCommand command)
        {
            await _mediator.Send(command);

            return Success("admin added successfully");
        }


        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
        {
            var result = await _mediator.Send(command);
            return Success(result);
        }
    }
}
