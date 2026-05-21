using System.Net;
using System.Net.Mail;

namespace MyAppBackend.Services
{
    public interface IEmailService
    {
        Task SendPriceAlertAsync(string toEmail, string productName, string merchantName, double targetPrice, double actualPrice);
    }

    public class EmailService : IEmailService
    {
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _senderEmail;
        private readonly string _senderPassword;
        private readonly string _senderName;
        private readonly bool _isConfigured;

        public EmailService(IConfiguration config)
        {
            _smtpHost = config["Email:SmtpHost"] ?? "";
            _smtpPort = int.TryParse(config["Email:SmtpPort"], out var p) ? p : 587;
            _senderEmail = config["Email:SenderEmail"] ?? "";
            _senderPassword = config["Email:SenderPassword"] ?? "";
            _senderName = config["Email:SenderName"] ?? "DeliDeal";
            _isConfigured = !string.IsNullOrWhiteSpace(_smtpHost) && !string.IsNullOrWhiteSpace(_senderEmail) && !string.IsNullOrWhiteSpace(_senderPassword);
        }

        public async Task SendPriceAlertAsync(string toEmail, string productName, string merchantName, double targetPrice, double actualPrice)
        {
            var subject = $"🔔 DeliDeal: {productName} är nu {actualPrice:0.##} kr hos {merchantName}!";
            var body = $@"
<html>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
  <div style='background-color: #2d6a4f; padding: 20px; text-align: center;'>
    <h1 style='color: #f4a300; margin: 0;'>DeliDeal</h1>
  </div>
  <div style='padding: 24px;'>
    <h2 style='color: #2d6a4f;'>🎉 Din bevakade produkt är nu tillgänglig till ditt önskade pris!</h2>
    <p><strong>{productName}</strong> finns nu hos <strong>{merchantName}</strong> till priset:</p>
    <p style='font-size: 2em; color: #f4a300; font-weight: bold;'>{actualPrice:0.##} kr</p>
    <p style='color: #666;'>Du bevakade denna produkt för {targetPrice:0.##} kr eller lägre.</p>
    <a href='http://localhost:4200/dashboard'
       style='display: inline-block; background-color: #2d6a4f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;'>
      Gå till DeliDeal
    </a>
  </div>
  <div style='background-color: #f4f4f4; padding: 12px; text-align: center; color: #999; font-size: 12px;'>
    Du får det här mailet för att du har satt upp en prisbevakning på DeliDeal.
  </div>
</body>
</html>";

            if (!_isConfigured)
            {
                Console.WriteLine($"[EMAIL STUB] To: {toEmail} | Subject: {subject}");
                Console.WriteLine($"[EMAIL STUB] {productName} @ {merchantName}: {actualPrice} kr (target: {targetPrice} kr)");
                return;
            }

            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(_senderEmail, _senderPassword)
            };

            using var message = new MailMessage
            {
                From = new MailAddress(_senderEmail, _senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

            await client.SendMailAsync(message);
            Console.WriteLine($"[EMAIL] Sent price alert to {toEmail} for {productName} @ {actualPrice} kr");
        }
    }
}
