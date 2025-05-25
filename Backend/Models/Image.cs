using System;
using System.Collections.Generic;

namespace NeuralEye.Models;

public partial class Image
{
    public int Id { get; set; }

    public byte[]? ImageData { get; set; }

    public string? ExtractedText { get; set; }

    public string? UserId { get; set; }
}
