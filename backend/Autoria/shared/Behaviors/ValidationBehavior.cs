using System.Collections.Generic;
using Autoria.shared.Exceptions;
using FluentValidation;
using MediatR;

namespace Autoria.shared.Behaviors
{
    public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : IRequest<TResponse>
    {
        private readonly IEnumerable<IValidator<TRequest>> _validator;

        public ValidationBehavior(IEnumerable<IValidator<TRequest>> validator)
        {
            _validator = validator;
        }
        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (!_validator.Any())
            {
                return await next();
            }

            var context = new ValidationContext<TRequest>(request);

            var failures = _validator.Select(v => v.Validate(context)).SelectMany(result => result.Errors)
                .Where(failure => failure != null).ToList();

            if (failures.Any())
            {
                var errors = failures.Select(f=> f.ErrorMessage).ToList();

                throw new BadRequestException("validation failed" , errors);

            }

            return await next(); 
        }
    }
}
