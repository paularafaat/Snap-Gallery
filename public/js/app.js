let currentPage = 1;
let searchQuery = '';
const accessKey = 'xn6naAWdMtUcZ9eZ8cSLwrF-ga8xI03P7DHRUoGTCU4';
const photoGallery = document.getElementById('photo-gallery');
const modal = document.getElementById('photo-modal');
const modalImage = document.getElementById('modal-image');
const downloadBtn = document.getElementById('download-btn');
const closeBtn = document.getElementsByClassName('close')[0];
const photosPerPage = 16;

// Fetch and display photos
async function fetchPhotos(page, query = '') {
    const endpoint = query 
        ? `https://api.unsplash.com/search/photos/?client_id=${accessKey}&query=${query}&page=${page}&per_page=${photosPerPage}` 
        : `https://api.unsplash.com/photos/?client_id=${accessKey}&page=${page}&per_page=${photosPerPage}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        const photos = query ? data.results : data;
        displayPhotos(photos);
        togglePaginationButtons(data.total || photos.length);
    } catch (error) {
        console.error('Error fetching photos:', error);
    }
}

// Display photos in the gallery
function displayPhotos(photos) {
    photoGallery.innerHTML = '';
    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.urls.small;
        img.alt = photo.alt_description || 'Unsplash Photo';
        img.onclick = () => openModal(photo.urls.full, photo.urls.full, photo.alt_description); // Open modal on click
        photoGallery.appendChild(img);
    });
}

// Open modal and handle download
function openModal(imageUrl, downloadUrl, photoAlt) {
    modal.style.display = "flex";
    modalImage.src = imageUrl;

    downloadBtn.onclick = async (event) => {
        event.preventDefault(); // Prevent default link behavior

        try {
            // Fetch the image as a Blob
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const blob = await response.blob();

            // Determine the file extension based on MIME type
            const contentType = blob.type;
            const fileExtension = getFileExtensionFromMimeType(contentType) || 'jpg';

            // Use the photo's alt text or a default name
            const filename = photoAlt ? `${photoAlt.replace(/\s+/g, '_')}.${fileExtension}` : `photo.${fileExtension}`;

            // Create a temporary link to download the Blob
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename; // Set the filename with extension
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };
}

// Function to get file extension from MIME type
function getFileExtensionFromMimeType(mimeType) {
    const mimeTypes = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        // Add more MIME types if needed
    };
    return mimeTypes[mimeType] || 'jpg'; // Default to 'jpg' if MIME type is not recognized
}

// Change page
function changePage(direction) {
    currentPage += direction;
    fetchPhotos(currentPage, searchQuery);
    document.getElementById('prev-page').disabled = currentPage === 1;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// Search photos
function searchPhotos() {
    const input = document.getElementById('search-input').value.trim();
    if (input !== '') {
        searchQuery = input;
        currentPage = 1;  // Reset to first page for new search
        fetchPhotos(currentPage, searchQuery);
    }
}

// Toggle pagination buttons
function togglePaginationButtons(photoCount) {
    const nextPageButton = document.getElementById('next-page');
    nextPageButton.disabled = photoCount < photosPerPage;  // Disable if fewer than photosPerPage photos returned
}

// Close the modal when the "x" is clicked
closeBtn.onclick = () => {
    modal.style.display = "none";
};

// Close the modal when clicking outside the image
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Initial fetch
fetchPhotos(currentPage);
