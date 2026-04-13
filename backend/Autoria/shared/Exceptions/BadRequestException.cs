namespace Autoria.shared.Exceptions
{
    public class BadRequestException : Exception
    {
        public List<string>? Errors { get; set; }

        public BadRequestException(string message, List<string>? errors = null)
        {
            Errors = errors;
        }
    }
}
