namespace NeuralEye.Services
{
    public interface ITextExtractionService
    {
        public string ExtractText(string image);
        public byte[] ConvertHexStringToByteArray(string image);
    }
}
