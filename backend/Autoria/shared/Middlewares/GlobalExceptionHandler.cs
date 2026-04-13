
using Autoria.shared.Dtos;
using Autoria.shared.Exceptions;


namespace Autoria.shared.Middlewares
{
    public class GlobalExceptionHandler : IMiddleware
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }


        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            var (statusCode, response) = ex switch
            {
                BadRequestException e => (400, ApiResponse<string>.Fail(e.Message, e.Errors)),
               

                NotFoundException e => (404, ApiResponse<string>.Fail(e.Message)),
                UnauthorizedException e => (401, ApiResponse<string>.Fail(e.Message)),
                ForbiddenException e => (403, ApiResponse<string>.Fail(e.Message)),
                _ => (500, ApiResponse<string>.Fail("An unexpected error occurred"))
            };

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
