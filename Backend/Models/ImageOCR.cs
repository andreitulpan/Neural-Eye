using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace NeuralEye.Models
{
    public class ImageOCR
    {
        [JsonPropertyName("image")]
        public string Image { get; set; } = string.Empty;

        [JsonPropertyName("user_id")]
        public int UserId { get; set; }
    }
}
