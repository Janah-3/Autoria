using Autoria.Infrastructure.Email.Contracts;
using Autoria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Autoria.features.MileageTracking.BackgroundJobs
{
    public class MileageReminderJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<MileageReminderJob> _logger;

        public MileageReminderJob(IServiceScopeFactory scopeFactory, ILogger<MileageReminderJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayUntilNextRun();
                _logger.LogInformation("MileageReminderJob: next run in {Hours} hours.", delay.TotalHours);

                await Task.Delay(delay, stoppingToken);

                if (!stoppingToken.IsCancellationRequested)
                    await SendRemindersAsync(stoppingToken);
            }
        }

        private async Task SendRemindersAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("MileageReminderJob: sending monthly mileage reminders...");

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            // Get all users who have at least one car
            var usersWithCars = await db.Cars
                .Include(c => c.User)
                .Where(c => c.User.Email != null)
                .GroupBy(c => new { c.UserId, c.User.Email, c.User.FullName })
                .Select(g => new
                {
                    g.Key.UserId,
                    g.Key.Email,
                    g.Key.FullName,
                    CarCount = g.Count()
                })
                .ToListAsync(cancellationToken);

            var successCount = 0;
            var failCount = 0;

            foreach (var user in usersWithCars)
            {
                try
                {
                    // Get latest mileage entry for this user
                    var lastEntry = await db.MileageEntries
                        .Where(e => e.UserId == user.UserId)
                        .OrderByDescending(e => e.LoggedAt)
                        .FirstOrDefaultAsync(cancellationToken);

                    var lastLoggedText = lastEntry is not null
                        ? $"Your last logged mileage was <strong>{lastEntry.Mileage:N0} km</strong> on {lastEntry.LoggedAt:dd MMM yyyy}."
                        : "You haven't logged any mileage yet.";

                    var body = $@"
                    <p>Hi {user.FullName},</p>
                    <p>This is your monthly reminder to update your vehicle mileage on <strong>Autoria</strong>.</p>
                    <p>{lastLoggedText}</p>
                    <p>Keeping your mileage up to date helps us notify you when your maintenance reminders are due.</p>
                    <p>You have <strong>{user.CarCount}</strong> registered vehicle(s) on Autoria.</p>
                    <br/>
                    <p>Stay on top of your car's health!</p>
                    <p>— The Autoria Team</p>";

                    await emailService.SendMailAsync(
                        user.Email!,
                        "🚗 Monthly Mileage Reminder — Autoria",
                        body);

                    successCount++;
                }
                catch (Exception ex)
                {
                    failCount++;
                    _logger.LogError(ex, "MileageReminderJob: failed to send email to {Email}.", user.Email);
                }
            }

            _logger.LogInformation(
                "MileageReminderJob: done. Sent: {Success}, Failed: {Fail}.",
                successCount, failCount);
        }

        /// <summary>
        /// Calculates delay until the 1st of next month at 9:00 AM UTC.
        /// </summary>
        private static TimeSpan GetDelayUntilNextRun()
        {
            var now = DateTime.UtcNow;
            var nextRun = new DateTime(now.Year, now.Month, 1, 9, 0, 0, DateTimeKind.Utc)
                               .AddMonths(1);

            var delay = nextRun - now;

            // Safety: if somehow delay is negative, run after 1 minute
            return delay > TimeSpan.Zero ? delay : TimeSpan.FromMinutes(1);
        }
    }
}
