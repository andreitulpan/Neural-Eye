import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { imageService, ImageRecord } from '@/services/imageService';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const Images = () => {
  const { user } = useAuth();

  console.log('Images component rendered');
  console.log('Current user:', user);
  console.log('User ID:', user?.id);
  console.log('Query enabled condition (!!user?.id):', !!user?.id);

  const { data: images, isLoading, error } = useQuery({
    queryKey: ['userImages', user?.id],
    queryFn: () => {
      console.log('Query function called, making API request for user ID:', user!.id);
      return imageService.getUserImages(user!.id);
    },
    enabled: !!user?.id,
  });

  console.log('Query state:', { images, isLoading, error });

  const convertVarbinaryToBase64 = (varbinaryData: any): string => {
    try {
      // Handle different formats that varbinary might come in
      if (!varbinaryData) return '';
      
      console.log('Converting varbinary data, type:', typeof varbinaryData, 'constructor:', varbinaryData.constructor?.name);
      
      let uint8Array: Uint8Array;
      
      if (varbinaryData instanceof Uint8Array) {
        uint8Array = varbinaryData;
      } else if (varbinaryData instanceof ArrayBuffer) {
        uint8Array = new Uint8Array(varbinaryData);
      } else if (Array.isArray(varbinaryData)) {
        // Sometimes varbinary comes as array of numbers
        uint8Array = new Uint8Array(varbinaryData);
      } else if (typeof varbinaryData === 'string') {
        // Sometimes it comes as a base64 string already
        return varbinaryData.startsWith('data:') ? varbinaryData : `data:image/jpeg;base64,${varbinaryData}`;
      } else if (varbinaryData.data && Array.isArray(varbinaryData.data)) {
        // Buffer-like object with data property
        uint8Array = new Uint8Array(varbinaryData.data);
      } else {
        console.warn('Unknown varbinary format:', varbinaryData);
        return '';
      }
      
      // Convert Uint8Array to base64
      let binary = '';
      const len = uint8Array.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      
      console.log('Converted to base64, length:', base64.length);
      return `data:image/jpeg;base64,${base64}`;
      
    } catch (error) {
      console.error('Error converting varbinary to base64:', error);
      return '';
    }
  };

  const renderImageContent = (image: ImageRecord) => {
    const base64Image = convertVarbinaryToBase64(image.imageData);
    
    return (
      <Card key={image.id} className="mb-4 bg-card border-border">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-card-foreground">Image #{image.id}</CardTitle>
            </div>
            <Badge variant="outline">
              {image.extractedText ? 'Text Found' : 'No Text'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Image Display */}
            <div>
              <h4 className="font-medium mb-2 text-card-foreground">Image</h4>
              {base64Image ? (
                <img 
                  src={base64Image} 
                  alt={`Captured image ${image.id}`}
                  className="w-full h-auto rounded border border-border"
                  onError={(e) => {
                    console.error('Image failed to load:', e);
                    console.log('Image src:', base64Image.substring(0, 100) + '...');
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded border border-border flex items-center justify-center text-muted-foreground">
                  No image data
                </div>
              )}
            </div>
            
            {/* Extracted Text */}
            <div>
              <h4 className="font-medium mb-2 text-card-foreground">Extracted Text</h4>
              <ScrollArea className="h-48 w-full rounded border border-border p-3 bg-muted">
                {image.extractedText ? (
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{image.extractedText}</p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No text extracted from this image</p>
                )}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLoading = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">My Images</h1>
          <p className="text-muted-foreground mt-2">
            View all your captured images and extracted text
          </p>
        </div>

        {isLoading ? (
          renderLoading()
        ) : error ? (
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <p className="text-destructive">Failed to load images. Please try again.</p>
            </CardContent>
          </Card>
        ) : !images || images.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No images found. Start capturing images to see them here.</p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="mb-4">
              <Badge variant="secondary">
                {images.length} image{images.length !== 1 ? 's' : ''} found
              </Badge>
            </div>
            {images.map(renderImageContent)}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Images;
