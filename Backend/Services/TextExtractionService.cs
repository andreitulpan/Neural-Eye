using Tesseract;

namespace NeuralEye.Services
{
    public class TextExtractionService : ITextExtractionService
    {
        public string ExtractText(string image)
        {
            var tessdataPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, @"..\..\..\tessdata"));

            var ocrEngine = new TesseractEngine(tessdataPath, "eng", EngineMode.Default);

            var bytes = ConvertHexStringToByteArray(image);

            var img = Pix.LoadFromMemory(bytes);
            var page = ocrEngine.Process(img);
            var text = page.GetText();

            return text;
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
