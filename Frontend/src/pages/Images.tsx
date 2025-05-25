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
      return await imageService.getUserImages(user!.id);
    },
    enabled: !!user?.id,
  });

  console.log('Query state:', { images, isLoading, error });

  const renderImageContent = (image: ImageRecord) => {
    // Convert hex string back to base64 for display
    const base64Image = image.imageData ? `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(image.imageData.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])))}` : '';
    
    return (
      <Card key={image.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">Image #{image.id}</CardTitle>
              <CardDescription>
                User ID: {image.user_id}
              </CardDescription>
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
              <h4 className="font-medium mb-2">Image</h4>
              {image.imageData ? (
                <img 
                  src={base64Image} 
                  alt={`Captured image ${image.id}`}
                  className="w-full h-48 object-cover rounded border"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded border flex items-center justify-center text-gray-500">
                  No image data
                </div>
              )}
            </div>
            
            {/* Extracted Text */}
            <div>
              <h4 className="font-medium mb-2">Extracted Text</h4>
              <ScrollArea className="h-48 w-full rounded border p-3 bg-gray-50">
                {image.extractedText ? (
                  <p className="text-sm whitespace-pre-wrap">{image.extractedText}</p>
                ) : (
                  <p className="text-gray-500 text-sm italic">No text extracted from this image</p>
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
        <Card key={i}>
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
          <h1 className="text-3xl font-bold">My Images</h1>
          <p className="text-muted-foreground mt-2">
            View all your captured images and extracted text
          </p>
        </div>

        {isLoading ? (
          renderLoading()
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">Failed to load images. Please try again.</p>
            </CardContent>
          </Card>
        ) : !images || images.length === 0 ? (
          <Card>
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
