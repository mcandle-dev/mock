import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Home, CreditCard, Gift, User, Scan, MapPin, ShoppingBag, Fingerprint, CheckCircle2, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:4000');

function App() {
  const [tab, setTab] = useState('HOME'); // HOME, CARD, BENEFITS, MY
  const [screen, setScreen] = useState('IDLE'); // IDLE, SCANNING, CONNECTED, ORDER, KAKAOPAY, DONE
  const [store, setStore] = useState(null);
  const [order, setOrder] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    socket.on('ble-connection-success', (data) => {
      setStore(data.store);
      setScreen('CONNECTED');
    });

    socket.on('receive-order', (orderData) => {
      setOrder(orderData);
      setScreen('ORDER');
    });

    socket.on('offline-payment-notification', (data) => {
      setReceipt(data);
      setScreen('DONE');
    });

    return () => {
      socket.off('ble-connection-success');
      socket.off('receive-order');
      socket.off('offline-payment-notification');
    };
  }, []);

  const handleStartScan = (userIds) => {
    setScreen('SCANNING');
    setTimeout(() => {
      socket.emit('customer-scan', userIds);
    }, 3000);
  };

  const handleProceedToPay = () => {
    setScreen('KAKAOPAY');
  };

  const handleFingerprintPay = () => {
    setTimeout(() => {
      const finalReceipt = {
        product: order.product,
        amount: order.product.price,
        paymentMethod: '카카오페이',
        points: Math.floor(order.product.price * 0.1),
        date: new Date().toLocaleString()
      };
      setReceipt(finalReceipt);
      setScreen('DONE');
      socket.emit('customer-payment-complete', finalReceipt);
    }, 2000);
  };

  const reset = () => {
    setTab('HOME');
    setScreen('IDLE');
    setOrder(null);
    setReceipt(null);
  };

  const HomeScreen = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content">
      <div style={{ padding: '8px 0 24px 0' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 400, marginBottom: '4px' }}>안녕하세요!</h1>
          <p style={{ color: 'var(--md-text-secondary)', fontSize: '14px' }}>김준호 님 👋</p>
        </div>
      </div>
      <div className="card-gold">
        <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px', fontWeight: 500 }}>VIP MEMBER ⭐</p>
        <h2 style={{ fontSize: '32px', marginBottom: '24px', fontWeight: 400 }}>125,000 P</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>현대백화점 멤버십</p>
            <p style={{ fontWeight: 500, fontSize: '14px' }}>HD2023091234</p>
          </div>
          <div style={{ background: 'white', padding: '8px', borderRadius: '4px' }}>
            <div style={{ width: '60px', height: '30px', background: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px)' }}></div>
          </div>
        </div>
      </div>
      <h3 style={{ marginBottom: '12px', marginTop: '8px' }}>오늘의 혜택</h3>
      <div className="glass-panel" style={{ borderLeft: '4px solid var(--md-primary)' }}>
        <p>👟 스포츠 브랜드 10% 추가 할인</p>
      </div>
      <div className="glass-panel" style={{ borderLeft: '4px solid var(--md-primary)' }}>
        <p>☕ VIP 라운지 금일 무료 이용 가능</p>
      </div>
    </motion.div>
  );

  const CardTab = () => (
    <div className="content">
      {screen === 'IDLE' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: '48px' }}>
          <div className="card-gold" style={{ width: '280px', height: '180px', margin: '0 auto 32px', transform: 'rotate(-5deg)' }}></div>
          <h2 style={{ marginBottom: '8px' }}>멤버십 결제</h2>
          <p style={{ color: 'var(--md-text-secondary)', marginBottom: '32px', lineHeight: '20px' }}>매장 VPOS 근처에서<br />자동으로 연결됩니다</p>
          <button className="btn btn-primary" onClick={() => handleStartScan('HD2023091234')} style={{ marginBottom: '12px' }}>김준호 (VIP)</button>
          <button className="btn btn-outline" onClick={() => handleStartScan('HD2023091235')} style={{ marginBottom: '12px' }}>이영희 (GOLD)</button>
          <button className="btn btn-outline" onClick={() => handleStartScan('HD2023091236')} style={{ marginBottom: '12px' }}>박철수 (Friends)</button>
          <button className="btn btn-outline" onClick={() => handleStartScan('HD2023091237')} style={{ marginBottom: '12px' }}>최지은 (VIP)</button>
          <button className="btn btn-outline" onClick={() => handleStartScan('HD2023091238')}>정수민 (GOLD)</button>
        </motion.div>
      )}
      {screen === 'SCANNING' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: '64px' }}>
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 32px', border: '2px solid var(--md-primary)', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="scan-animation"></div>
            <Scan size={48} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.3, color: 'var(--md-primary)' }} />
          </div>
          <h2 style={{ marginBottom: '8px' }}>주변 매장 검색 중...</h2>
          <p style={{ color: 'var(--md-text-secondary)' }}>블루투스 기기를 찾고 있습니다</p>
        </motion.div>
      )}
      {screen === 'CONNECTED' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
          <div className="badge badge-success" style={{ padding: '12px 20px', borderRadius: '24px', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <CheckCircle2 size={18} /> 매장 연결 완료
          </div>
          <div className="glass-panel" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'var(--md-primary)', padding: '12px', borderRadius: '8px' }}>
                <MapPin color="white" size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{store?.name}</h3>
                <p style={{ color: 'var(--md-text-secondary)', fontSize: '12px' }}>{store?.location}</p>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--md-text-secondary)' }}>담당 직원: {store?.staff}</p>
          </div>
          <div style={{ padding: '32px 16px', color: 'var(--md-text-secondary)' }}>
            <div className="loader" style={{ marginBottom: '16px' }}></div>
            <p style={{ fontSize: '14px', lineHeight: '20px' }}>직원이 혜택을 안내해드릴 예정입니다.<br />잠시만 기다려주세요.</p>
          </div>
        </motion.div>
      )}
      {screen === 'ORDER' && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="glass-panel" style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-primary)', marginBottom: '16px' }}>
            <Bell size={20} /> <span style={{ fontWeight: 500, fontSize: '14px' }}>새 주문이 도착했습니다</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '12px' }}>📦 주문 상품</h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--md-surface-variant)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={32} opacity={0.5} color="var(--md-text-secondary)" />
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '16px', marginBottom: '4px' }}>{order?.product.name}</p>
                <p style={{ color: 'var(--md-text-secondary)', fontSize: '12px', marginBottom: '8px' }}>사이즈: {order?.product.size} / 색상: {order?.product.color}</p>
                <p style={{ fontWeight: 500, fontSize: '16px' }}>{order?.product.price.toLocaleString()}원</p>
              </div>
            </div>
            <div style={{ background: 'var(--md-surface-variant)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>상품 금액</span>
                <span>{order?.product.price.toLocaleString()}원</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--md-primary)', fontSize: '14px' }}>
                <span>카카오페이 혜택</span>
                <span>+{(order?.product.price * 0.1).toLocaleString()}P 적립</span>
              </div>
              <div style={{ borderTop: '1px solid var(--md-divider)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 500, fontSize: '18px' }}>
                <span>총 결제액</span>
                <span>{order?.product.price.toLocaleString()}원</span>
              </div>
            </div>
          </div>
          <button className="btn btn-kakao" onClick={handleProceedToPay}>카카오페이로 결제하기</button>
          <button className="btn btn-outline" style={{ marginTop: '8px' }} onClick={() => setScreen('CONNECTED')}>취소</button>
        </motion.div>
      )}
      {screen === 'KAKAOPAY' && (
        <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#FFFFFF', color: 'rgba(0,0,0,0.87)', margin: '-16px', height: 'calc(100% + 32px)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
            <div style={{ background: '#FEE500', padding: '4px 8px', borderRadius: '4px', fontWeight: 900, fontSize: '12px', color: 'rgba(0,0,0,0.87)' }}>pay</div>
            <span style={{ fontWeight: 500, fontSize: '16px' }}>카카오페이</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ color: 'rgba(0,0,0,0.60)', marginBottom: '8px', fontSize: '14px' }}>현대백화점 압구정점</p>
            <h2 style={{ fontSize: '32px', fontWeight: 400, marginBottom: '48px', color: 'rgba(0,0,0,0.87)' }}>{order?.product.price.toLocaleString()}원</h2>
            <div style={{ background: '#F5F5F5', padding: '16px', borderRadius: '8px', textAlign: 'left', marginBottom: '48px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.60)', marginBottom: '8px' }}>결제 수단</p>
              <p style={{ fontWeight: 500, fontSize: '14px', color: 'rgba(0,0,0,0.87)' }}>신한카드 (1234) <span style={{ float: 'right', color: '#1976D2', fontWeight: 500 }}>변경</span></p>
            </div>
            <div onClick={handleFingerprintPay} style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '80px', height: '80px', border: '2px solid rgba(0,0,0,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Fingerprint size={40} color="#1976D2" />
              </div>
              <p style={{ fontWeight: 500, fontSize: '14px', color: 'rgba(0,0,0,0.87)' }}>지문 인증으로 결제</p>
            </div>
          </div>
        </motion.div>
      )}
      {screen === 'DONE' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', paddingTop: '32px' }}>
          <div style={{ background: 'var(--md-success)', width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 400, marginBottom: '8px' }}>결제 완료!</h2>
          <p style={{ color: 'var(--md-text-secondary)', marginBottom: '32px', fontSize: '14px' }}>감사합니다. 즐거운 쇼핑 되세요.</p>
          <div className="glass-panel" style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '12px', color: 'var(--md-text-secondary)', marginBottom: '12px', fontWeight: 500 }}>구매 내역</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>{receipt?.product?.name}</span>
              <span>{receipt?.amount?.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--md-divider)', paddingTop: '8px', marginTop: '8px', color: 'var(--md-primary)', fontSize: '14px' }}>
              <span>적립 포인트</span>
              <span>+{receipt?.points?.toLocaleString()} P</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={reset}>홈으로 돌아가기</button>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      {tab === 'HOME' && <HomeScreen />}
      {tab === 'CARD' && <CardTab />}
      <div className="nav-bar">
        <div className={`nav-item ${tab === 'HOME' ? 'active' : ''}`} onClick={() => setTab('HOME')}>
          <Home size={20} /> <span>홈</span>
        </div>
        <div className={`nav-item ${tab === 'CARD' ? 'active' : ''}`} onClick={() => { setTab('CARD'); if (screen === 'DONE') reset(); }}>
          <CreditCard size={20} /> <span>카드</span>
        </div>
        <div className={`nav-item`}><Gift size={20} /> <span>혜택</span></div>
        <div className={`nav-item`}><User size={20} /> <span>MY</span></div>
      </div>
    </div>
  );
}

export default App;
