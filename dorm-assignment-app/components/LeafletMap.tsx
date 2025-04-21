import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  Animated,
  Easing,
} from 'react-native';
import WebView from 'react-native-webview';
import { DataTable } from 'react-native-paper';
import ip from '../constants/IP';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.5; // 与原样式一致

export default function LeafletMap() {
  const [selectedDorm, setSelectedDorm] = useState(null);
  const [dorms, setDorms] = useState([]);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const webviewRef = useRef(null);

  /* ---------------- bottom panel 动画 ---------------- */
  const translateY = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: selectedDorm ? 0 : PANEL_HEIGHT,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [selectedDorm]);

  /* ---------------- 获取宿舍数据 ---------------- */
  useEffect(() => {
    const fetchDorms = async () => {
      try {
        const res = await fetch(`http://${ip}:3000/getdorminfo`);
        const json = await res.json();
        if (json.success) {
          const validDorms = json.data.filter(
            (d) => d && typeof d.lat === 'number' && typeof d.lng === 'number' && !isNaN(d.lat) && !isNaN(d.lng)
          );
          setDorms(validDorms);
        } else {
          console.error('Dorm fetch failed:', json.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchDorms();
  }, []);

  /* ---------------- 将 dorm 数据发送给 WebView ---------------- */
  useEffect(() => {
    if (dorms.length > 0 && webViewLoaded && webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify(dorms));
    }
  }, [dorms, webViewLoaded]);

  /* ---------------- WebView HTML ---------------- */
  const leafletHTML = `<!DOCTYPE html><html><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/><link rel='stylesheet' href='https://unpkg.com/leaflet/dist/leaflet.css'/><style>html,body,#map{height:100%;margin:0;padding:0}.leaflet-top{top:5%!important}</style></head><body><div id='map'></div><script src='https://unpkg.com/leaflet/dist/leaflet.js'></script><script>(function(){const map=L.map('map').setView([43.0775572,-89.4170403],15);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'Map data © OpenStreetMap contributors'}).addTo(map);let houseIcon=L.icon({iconUrl:'https://picsbusket.s3.us-east-1.amazonaws.com/home.png',iconSize:[40,40],iconAnchor:[20,40],popupAnchor:[0,-40]});function sendReady(){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage('MAP_LOADED')}function receive(e){if(!e||!e.data)return;if(e.data==='MAP_LOADED')return;const dorms=JSON.parse(e.data);map.eachLayer(l=>{if(l instanceof L.Marker)map.removeLayer(l)});dorms.forEach(d=>{const m=L.marker([d.lat,d.lng],{icon:houseIcon}).addTo(map);m.bindPopup(d.name||'Unnamed');m.on('click',()=>window.ReactNativeWebView.postMessage(JSON.stringify(d)))});if(dorms.length>1){map.fitBounds(dorms.map(d=>[d.lat,d.lng]));}}window.addEventListener('message',receive);document.addEventListener('message',receive);map.whenReady(sendReady);})();</script></body></html>`;

  /* ---------------- WebView message handler ---------------- */
  const onMessage = (event) => {
    const data = event.nativeEvent.data;
    if (data === 'MAP_LOADED') {
      setWebViewLoaded(true);
      return;
    }
    try {
      const dormData = JSON.parse(data);
      setSelectedDorm(dormData);
    } catch (err) {
      console.warn('Failed to parse dorm data', err);
    }
  };

  /* ---------------- 基础解析 ---------------- */
  const parsedInfra =
    selectedDorm && selectedDorm.infrastructure
      ? typeof selectedDorm.infrastructure === 'string'
        ? JSON.parse(selectedDorm.infrastructure)
        : selectedDorm.infrastructure
      : null;

  /* ---------------- 渲染 ---------------- */
  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: leafletHTML }}
        style={styles.map}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        mixedContentMode="always"
        allowFileAccess
        scrollEnabled={false}
        bounces={false}
      />

      {/* Animated Bottom Panel */}
      <Animated.View style={[styles.bottomPanel, { transform: [{ translateY }] }]}>
        {selectedDorm && (
          <>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>{selectedDorm.name}</Text>
              <TouchableOpacity onPress={() => setSelectedDorm(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.panelContent}>
              {selectedDorm.pictures && (
                <ScrollView horizontal style={{ marginTop: 12 }}>
                  {selectedDorm.pictures.split(',').map((url, i) => (
                    <Image key={i} source={{ uri: url.trim() }} style={styles.photo} resizeMode="cover" />
                  ))}
                </ScrollView>
              )}
              <Text style={styles.sectionTitle}>General</Text>
              <Text>Zip: {selectedDorm.zip}</Text>
              <Text>Gender Inclusive: {selectedDorm.gender_inclusive ? 'Yes' : 'No'}</Text>

              {parsedInfra && (
                <>
                  <Text style={styles.sectionTitle}>Infrastructure</Text>
                  {Object.entries(parsedInfra).map(([k, v]) => (
                    <Text key={k} style={styles.infrastructureRow}>
                      <Text style={styles.infrastructureKey}>{k}: </Text>
                      {v === 'nan' ? '—' : v}
                    </Text>
                  ))}
                </>
              )}

              {selectedDorm.rooms?.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Room Types & Price</Text>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title style={{ flex: 2 }}>Room Type</DataTable.Title>
                      <DataTable.Title numeric>Price / year ($)</DataTable.Title>
                    </DataTable.Header>
                    {selectedDorm.rooms.map((room) => (
                      <DataTable.Row key={room.room_id}>
                        <DataTable.Cell style={{ flex: 2 }}>{room.room_type}</DataTable.Cell>
                        <DataTable.Cell numeric>{room.price_year.toLocaleString()}</DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </DataTable>
                </>
              )}
            </ScrollView>
          </>
        )}
      </Animated.View>
    </View>
  );
}

/* ---------------- 样式 ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  bottomPanel: {
    position: 'absolute',
    bottom: 75,
    width: '100%',
    height: PANEL_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: { fontSize: 18, fontWeight: 'bold' },
  closeButton: { fontSize: 20, padding: 5 },
  panelContent: { marginTop: 6 },
  sectionTitle: { marginTop: 10, fontWeight: '800' },
  infrastructureRow: { fontSize: 14, marginVertical: 1 },
  infrastructureKey: { fontWeight: '600' },
  photo: {
    width: 120,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
  },
});
