using IronOcr;
using Microsoft.AspNetCore.Hosting.Server;

namespace NeuralEye.Services
{
    public class TextExtractionService : ITextExtractionService
    {
        private readonly IConfiguration _configuration;

        public TextExtractionService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string ExtractText(string image)
        {
            var key = _configuration["IronOCR:Key"];
            License.LicenseKey = key;

            var Ocr = new IronTesseract();

            var imageBytes = ConvertHexStringToByteArray(image);
            var input = new OcrInput();

            input.LoadImage(imageBytes);

            var result = Ocr.Read(input);
            Console.WriteLine(result.Text);

            return result.Text;
        }

        public byte[] ConvertHexStringToByteArray(string image)
        {
            var bytes = new byte[image.Length / 2];
            for (int i = 0; i < image.Length; i += 2)
                bytes[i / 2] = Convert.ToByte(image.Substring(i, 2), 16);
            return bytes;
        }
    }
}
