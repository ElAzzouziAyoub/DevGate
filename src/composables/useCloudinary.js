/*eslint-disable*/
export async function uploadImage(image) {
    if(image === null) {
        return null;
    }
    
    try {
        let formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'ForumUploadPreset');

        const uploadedImage = await fetch('https://api.cloudinary.com/v1_1/dqhbz9i7t/image/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await uploadedImage.json();

        if (!uploadedImage.ok) {
            console.error('Upload failed:', data);
            throw new Error(data.error?.message || 'Unknown error');
        }

        return data.secure_url;
    } catch (error) {
        throw error;
    }
}