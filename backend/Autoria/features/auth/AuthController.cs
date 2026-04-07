using Autoria.features.auth.Commands.forgetPassword;
using Autoria.features.auth.Commands.Login;
using Autoria.features.auth.Commands.logout;
using Autoria.features.auth.Commands.register;
using Autoria.features.auth.Commands.ResendVerificationEmail;
using Autoria.features.auth.Commands.ResetPassword;
using Autoria.features.auth.Commands.VerifyEmail;
using MediatR;
using Microsoft.AspNetCore.Mvc;


namespace Autoria.features.auth
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController:ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {

            _mediator = mediator; 
        }

        [HttpPost("login")]
        public async Task<IActionResult> login(LoginCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }


        [HttpPost("register")]
        public async Task<IActionResult> register(RegisterCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);

        }

        [HttpPost("forgetPass")]
        public async Task<IActionResult> ForgetPass(ForgetPassCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(new
            {
                message = "a reset link has been sent."
            });
        }


        [HttpPost("ResetPass")]
        public async Task<IActionResult> RestPassword(ResetPassCommand command)
        {
            var result = await _mediator.Send(command);

            return Ok(new
            {
                message = "Password reset successfully"
            });
        }


        [HttpPost("logout")]
        public async Task<IActionResult> Logout(LogoutCommand command)
        {
            await _mediator.Send(command);
            return Ok(new { message = "Logged out successfully" });
        }

        
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail(VerifyEmailCommand command)
        {
            await _mediator.Send(command);
            return Ok("Email verified successfully");
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification(ResendVerificationEmailCommand command)
        {
            await _mediator.Send(command);
            return Ok("Verification email sent");
        }

    }
}
