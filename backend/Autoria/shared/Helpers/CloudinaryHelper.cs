namespace Autoria.shared.Helpers
{
    public static class CloudinaryHelper
    {
        public static string ExtractPublicId(string url)
        {
            var uri = new Uri(url);
            var segments = uri.AbsolutePath.Split('/');
            var uploadIndex = Array.IndexOf(segments, "upload");
            var relevantSegments = segments.Skip(uploadIndex + 2);
            var publicIdWithExt = string.Join("/", relevantSegments);
            return Path.ChangeExtension(publicIdWithExt, null);
        }
    }
}
