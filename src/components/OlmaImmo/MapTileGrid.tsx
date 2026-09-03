import React, { useMemo } from 'react';
import { getVisibleTiles, TILE_LAYERS, TileLayerType } from './webMercator';

interface MapTileGridProps {
  centerLat: number;
  centerLng: number;
  zoom: number;
  width: number;
  height: number;
  layerType?: TileLayerType;
}

export const MapTileGrid: React.FC<MapTileGridProps> = ({
  centerLat,
  centerLng,
  zoom,
  width,
  height,
  layerType = 'voyager',
}) => {
  const layer = TILE_LAYERS[layerType] || TILE_LAYERS.voyager;
  const intZoom = Math.floor(zoom);
  const zoomFactor = Math.pow(2, zoom - intZoom);
  const tileSize = 256 * zoomFactor;

  const tiles = useMemo(() => {
    if (width <= 0 || height <= 0) return [];
    return getVisibleTiles(centerLat, centerLng, zoom, width, height);
  }, [centerLat, centerLng, zoom, width, height]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#f2ede4]">
      {tiles.map((t) => (
        <img
          key={t.key}
          src={layer.getUrl(t.x, t.y, t.z)}
          alt=""
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute pointer-events-none transition-opacity duration-150"
          style={{
            left: `${Math.round(t.screenX)}px`,
            top: `${Math.round(t.screenY)}px`,
            width: `${Math.ceil(tileSize)}px`,
            height: `${Math.ceil(tileSize)}px`,
          }}
        />
      ))}

      {/* Discreet Tile Attribution */}
      <div className="absolute bottom-1 right-2 z-10 px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-xs text-[9px] text-stone-500 pointer-events-none">
        {layer.attribution}
      </div>
    </div>
  );
};
