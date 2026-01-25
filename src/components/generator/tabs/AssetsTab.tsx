import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  Search, 
  X, 
  AlertCircle,
  HardDrive,
  Grid3X3,
  List,
  MoreVertical,
  Edit2,
  Check
} from 'lucide-react';
import { useAssetLibrary, ImageAsset } from '../../../hooks/useAssetLibrary';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../../ui/dropdown-menu';
import { Progress } from '../../ui/progress';

interface AssetsTabProps {
  onSelectImage?: (asset: ImageAsset) => void;
}

type ViewMode = 'grid' | 'list';

export const AssetsTab: React.FC<AssetsTabProps> = ({ onSelectImage }) => {
  const {
    images,
    isLoading,
    error,
    uploadImage,
    uploadMultipleImages,
    deleteAsset,
    renameAsset,
    duplicateAsset,
    getStorageInfo,
  } = useAssetLibrary();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageInfo = getStorageInfo();

  // Filter images based on search
  const filteredImages = images.filter(img =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await uploadMultipleImages(files);
  }, [uploadMultipleImages]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // Start editing asset name
  const startEditing = (asset: ImageAsset) => {
    setEditingId(asset.id);
    setEditName(asset.name);
  };

  // Save edited name
  const saveEdit = () => {
    if (editingId && editName.trim()) {
      renameAsset(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Storage Usage */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Storage</span>
          </div>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {formatSize(storageInfo.used)} / {formatSize(storageInfo.max)}
          </span>
        </div>
        <Progress value={storageInfo.percentage} className="h-1.5" />
        {storageInfo.percentage > 80 && (
          <p className="text-[10px] text-amber-500 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Storage almost full
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          aria-label="Upload images"
        />
        
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-zinc-400'}`} />
        
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {isDragging ? 'Drop images here' : 'Click or drag images'}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          PNG, JPG, WebP, SVG, GIF (max 2MB each)
        </p>
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 rounded-xl flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full" />
          </div>
        )}
      </div>

      {/* Search and View Toggle */}
      {images.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images..."
              className="w-full h-9 pl-9 pr-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Assets Grid/List */}
      {filteredImages.length === 0 && images.length === 0 ? (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-500">No images yet</p>
          <p className="text-xs text-zinc-400 mt-1">Upload some images to get started</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-6">
          <Search className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
          <p className="text-sm text-zinc-500">No results for "{searchQuery}"</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-2">
          {filteredImages.map((asset) => (
            <div
              key={asset.id}
              className="group relative aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
            >
              <img
                src={asset.thumbnailUrl}
                alt={asset.name}
                className="w-full h-full object-cover"
                onClick={() => onSelectImage?.(asset)}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  {editingId === asset.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="flex-1 px-2 py-1 text-xs bg-black/50 border border-zinc-600 rounded text-white"
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="p-1 bg-green-500/80 rounded hover:bg-green-500"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-white truncate">{asset.name}</p>
                  )}
                </div>
              </div>

              {/* Action Menu */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 bg-black/50 rounded-md hover:bg-black/70 transition-colors">
                      <MoreVertical className="w-3.5 h-3.5 text-white" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem onClick={() => startEditing(asset)}>
                      <Edit2 className="w-3.5 h-3.5 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateAsset(asset.id)}>
                      <Copy className="w-3.5 h-3.5 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => deleteAsset(asset.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredImages.map((asset) => (
            <div
              key={asset.id}
              className="group flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer"
              onClick={() => onSelectImage?.(asset)}
            >
              <img
                src={asset.thumbnailUrl}
                alt={asset.name}
                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                {editingId === asset.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      className="flex-1 px-2 py-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                      className="p-1 bg-green-500 rounded hover:bg-green-600 text-white"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                      {asset.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {asset.width}×{asset.height} • {formatSize(asset.size)} • {asset.format.toUpperCase()}
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); startEditing(asset); }}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                  aria-label="Rename"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateAsset(asset.id); }}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                  aria-label="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}
                  className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asset Count */}
      {images.length > 0 && (
        <p className="text-xs text-center text-zinc-400">
          {filteredImages.length} of {images.length} image{images.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};
