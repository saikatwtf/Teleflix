"use client";

import { useState } from 'react';
import { FiDownload, FiPlay, FiExternalLink } from 'react-icons/fi';

interface FileInfo {
  file_id: string;
  file_size: number;
  quality: string;
  source?: string;
  format?: string;
}

interface FileListProps {
  files: FileInfo[];
}

export default function FileList({ files }: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(
    files.length > 0 ? files[0].file_id : null
  );

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file details
  const getSelectedFile = () => {
    return files.find(file => file.file_id === selectedFile);
  };

  // Handle download
  const handleDownload = async () => {
    if (!selectedFile) return;
    
    try {
      const response = await fetch(`/api/file/${selectedFile}`);
      const data = await response.json();
      window.open(data.download_link, '_blank');
    } catch (error) {
      // Silent fail in production
      alert('Failed to generate download link. Please try again.');
    }
  };

  // Handle stream
  const handleStream = async () => {
    if (!selectedFile) return;
    
    try {
      const response = await fetch(`/api/stream/${selectedFile}`);
      const data = await response.json();
      window.open(data.stream_link, '_blank');
    } catch (error) {
      // Silent fail in production
      alert('Failed to generate streaming link. Please try again.');
    }
  };

  // Handle external player
  const handleExternalPlayer = async () => {
    if (!selectedFile) return;
    
    try {
      const response = await fetch(`/api/stream/${selectedFile}`);
      const data = await response.json();
      
      // Generate VLC/MX Player links
      const vlcUrl = `vlc://${data.stream_link}`;
      const mxPlayerUrl = `intent:${data.stream_link}#Intent;package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent('Teleflix Stream')};end`;
      const nplayerUrl = `nplayer-${data.stream_link}`;
      
      // Create a modal with player options
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
          <h3 class="text-lg font-bold mb-4">Open with external player</h3>
          <div class="space-y-3">
            <a href="${vlcUrl}" class="block w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">VLC Player</a>
            <a href="${mxPlayerUrl}" class="block w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">MX Player</a>
            <a href="${nplayerUrl}" class="block w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">nPlayer</a>
          </div>
          <button id="close-modal" class="mt-4 w-full py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700">Close</button>
        </div>
      `;
      
      document.body.appendChild(modal);
      document.getElementById('close-modal')?.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    } catch (error) {
      // Silent fail in production
      alert('Failed to generate streaming link. Please try again.');
    }
  };

  if (files.length === 0) {
    return <div className="text-center py-8">No files available</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Available Files</h3>
      
      {/* File selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Quality
        </label>
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <button
              key={file.file_id}
              onClick={() => setSelectedFile(file.file_id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedFile === file.file_id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {file.quality}
              {file.source && ` • ${file.source}`}
              {file.format && ` • ${file.format}`}
            </button>
          ))}
        </div>
      </div>
      
      {/* File details */}
      {selectedFile && (
        <div className="mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Size: {formatFileSize(getSelectedFile()?.file_size || 0)}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          <FiDownload className="mr-2" />
          Download
        </button>
        
        <button
          onClick={handleStream}
          className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <FiPlay className="mr-2" />
          Stream Online
        </button>
        
        <button
          onClick={handleExternalPlayer}
          className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <FiExternalLink className="mr-2" />
          External Player
        </button>
      </div>
    </div>
  );
}