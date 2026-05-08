import React, { useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme/tokens';

interface Marker {
  id: string;
  lat: number;
  lng: number;
  color: string;
  image?: string;
  title?: string;
  description?: string;
}

interface LeafletMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
  onLocationSelect?: (lat: number, lng: number) => void;
  onMarkerPress?: (id: string) => void;
  interactive?: boolean;
}

export function LeafletMap({
  center = { lat: -4.8622, lng: -43.3561 },
  zoom = 13,
  markers = [],
  onLocationSelect,
  onMarkerPress,
  interactive = true,
}: LeafletMapProps) {
  const { theme, isDark } = useTheme();
  
  const mapHtml = useMemo(() => {
    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    const bgColor = isDark ? '#333333' : '#f0f0f0';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background: ${bgColor}; }
          #map { height: 100vh; width: 100vw; background: ${bgColor}; }
          .leaflet-tile-pane {
            filter: ${isDark 
              ? 'grayscale(1) brightness(2.2) contrast(0.6) invert(10%)' 
              : 'none'};
          }
          .leaflet-container { background: ${bgColor} !important; }
          .custom-pin {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid ${isDark ? '#000' : '#fff'};
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
          }
          /* Custom Popup Styling */
          .leaflet-popup-content-wrapper {
            background: ${isDark ? '#1a1a1a' : '#ffffff'};
            color: ${isDark ? '#ffffff' : '#000000'};
            border-radius: 16px;
            padding: 0;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          }
          .leaflet-popup-content {
            margin: 0;
            width: 220px !important;
          }
          .popup-container {
            display: flex;
            flex-direction: column;
          }
          .popup-image {
            width: 100%;
            height: 120px;
            object-fit: cover;
          }
          .popup-text {
            padding: 12px;
          }
          .popup-title {
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 4px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .popup-sub {
            font-size: 11px;
            color: ${isDark ? '#999' : '#666'};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .leaflet-popup-tip {
            background: ${isDark ? '#1a1a1a' : '#ffffff'};
          }
          .leaflet-popup-close-button {
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            dragging: ${interactive},
            touchZoom: ${interactive},
            scrollWheelZoom: ${interactive},
            doubleClickZoom: ${interactive},
            boxZoom: ${interactive}
          }).setView([${center.lat}, ${center.lng}], ${zoom});

          L.tileLayer('${tileUrl}', {
            maxZoom: 19
          }).addTo(map);

          const markers = ${JSON.stringify(markers)};
          markers.forEach(m => {
            const icon = L.divIcon({
              className: 'custom-div-icon',
              html: \`<div class="custom-pin" style="background-color: \${m.color}"></div>\`,
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            });
            const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
            
            if (m.title) {
              const popupHtml = \`
                <div class="popup-container">
                  \${m.image ? \`<img src="\${m.image}" class="popup-image" onerror="this.src='https://via.placeholder.com/220x120?text=Imagem+indisponivel'; this.style.opacity='0.6';" />\` : ''}
                  <div class="popup-text">
                    <div class="popup-title">\${m.title}</div>
                    <div class="popup-sub">\${m.description}</div>
                  </div>
                </div>
              \`;
              marker.bindPopup(popupHtml, {
                maxWidth: 220,
                className: 'custom-popup'
              });
            }

            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'onMarkerPress', id: m.id }));
            });
          });

          ${interactive ? `
            map.on('click', function(e) {
              const { lat, lng } = e.latlng;
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'onLocationSelect', lat, lng }));
            });
          ` : ''}

          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
        </script>
      </body>
      </html>
    `;
  }, [center, zoom, markers, interactive, isDark]);

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'onLocationSelect' && onLocationSelect) {
        onLocationSelect(data.lat, data.lng);
      }
      if (data.type === 'onMarkerPress' && onMarkerPress) {
        onMarkerPress(data.id);
      }
    } catch (e) {
      console.error('Map message error:', e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#f0f0f0' }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webview}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        allowFileAccessFromFileURLs
        mixedContentMode="always"
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.loading, { backgroundColor: isDark ? '#0a0a0a' : '#f0f0f0' }]}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
