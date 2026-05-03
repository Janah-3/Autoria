namespace Autoria.shared.Contracts
{
    public interface ICurrentUserService
    {
        string GetUserId();
        bool IsAuthenticated();
    }

}
